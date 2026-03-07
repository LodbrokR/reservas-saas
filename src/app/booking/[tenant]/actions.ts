'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createReservation(
    tenantSlug: string,
    resourceId: string,
    date: Date,
    timeStr: string,
    customerData: { fullName: string; email: string; phone: string }
) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de Vercel.' }
        }

        const supabase = createAdminClient()

        // 1. Obtener ID del Tenant (con datos de WhatsApp y política de solapamiento)
        const { data: tenant, error: tenantErr } = await supabase
            .from('tenants')
            .select('id, name, whatsapp_number, whatsapp_api_key, allow_overlap')
            .eq('slug', tenantSlug)
            .maybeSingle()

        if (tenantErr || !tenant) {
            return { error: `Negocio no encontrado. Detalles: ${tenantErr?.message || 'El negocio (slug) no existe en la BD'}` }
        }

        // 2. Verificar que el recurso existe y pertenece al tenant
        const { data: resource, error: resErr } = await supabase
            .from('resources')
            .select('id, name')
            .eq('id', resourceId)
            .eq('tenant_id', tenant.id)
            .maybeSingle()

        if (resErr || !resource) {
            return { error: `Recurso no válido o no pertenece a este negocio.` }
        }

        // 3. Crear o encontrar Cliente (Customer CRM)
        // Nota: Esto debería buscar por email para evitar duplicados, 
        // pero para el MVP insertamos o dejamos que Supabase resuelva
        let customerId = null;
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', customerData.email)
            .eq('tenant_id', tenant.id)
            .maybeSingle()

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            const { data: newCustomer, error: custErr } = await supabase
                .from('customers')
                .insert({
                    tenant_id: tenant.id,
                    full_name: customerData.fullName,
                    email: customerData.email,
                    phone: customerData.phone
                })
                .select('id')
                .single()

            if (custErr) return { error: 'Error registrando tus datos de cliente.' }
            customerId = newCustomer.id;
        }

        // 4. Calcular Start Time y End Time a partir del Date y el string "HH:MM"
        const startDate = new Date(date)
        const [hours, minutes] = timeStr.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate)
        endDate.setMinutes(endDate.getMinutes() + 30) // Asumimos bloque de 30 min por ahora

        // 5. Verificar colisión de horario (si el negocio no permite solapamiento)
        if (!tenant.allow_overlap) {
            const { data: clash } = await supabase
                .from('reservations')
                .select('id')
                .eq('tenant_id', tenant.id)
                .not('status', 'eq', 'canceled')  // Ignorar canceladas
                .lt('start_time', endDate.toISOString())   // Otra reserva que empieza antes que termine esta
                .gt('end_time', startDate.toISOString())   // Y termina después que empiece esta
                .eq('resource_id', resource.id)            // Fundamental: solapamiento solo importa POR RECURSO
                .limit(1)
                .maybeSingle()

            if (clash) {
                return { error: `❌ Ese horario (${timeStr} hrs) ya está ocupado. Por favor elige otro bloque disponible.` }
            }
        }

        // 6. Insertar la Reserva
        const { error: reserveErr } = await supabase
            .from('reservations')
            .insert({
                tenant_id: tenant.id,
                resource_id: resource.id,
                customer_id: customerId,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                status: 'confirmed',
                payment_status: 'unpaid'
            })

        if (reserveErr) {
            console.error("Booking Error:", reserveErr)
            return { error: reserveErr.message || 'Ese horario posiblemente ya está ocupado o hubo un error al guardar la reserva.' }
        }

        // 6. Enviar notificación WhatsApp al dueño del negocio (si tiene configurado CallMeBot)
        if (tenant.whatsapp_number && tenant.whatsapp_api_key) {
            try {
                const fechaFormateada = startDate.toLocaleDateString('es-CL', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })
                const horaFormateada = startDate.toLocaleTimeString('es-CL', {
                    hour: '2-digit', minute: '2-digit'
                })
                const mensaje = [
                    `🔔 *Nueva Reserva - ${tenant.name}*`,
                    ``,
                    `👤 Cliente: ${customerData.fullName}`,
                    `📧 Email: ${customerData.email}`,
                    `📱 Tel: ${customerData.phone}`,
                    ``,
                    `🗓️ Fecha: ${fechaFormateada}`,
                    `⏰ Hora: ${horaFormateada} hrs`,
                    `💼 Recurso: ${resource.name}`,
                ].join('\n')

                const encodedMsg = encodeURIComponent(mensaje)
                const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${tenant.whatsapp_number}&text=${encodedMsg}&apikey=${tenant.whatsapp_api_key}`
                await fetch(waUrl)
            } catch (waErr) {
                // No fallar la reserva si WhatsApp falla
                console.warn('WhatsApp notification failed:', waErr)
            }
        }

        // Refrescar el caché de la app para que el Admin Dashboard vea la reserva
        revalidatePath('/admin/reservas')
        revalidatePath('/admin/clientes')
        revalidatePath('/admin')

        return { success: true }

    } catch (e: any) {
        console.error("Critical Server Action Error:", e)
        return { error: `Error interno de validación: ${e.message}` }
    }
}

// Obtener los slots ya reservados para un día puntual y recurso opcional
export async function getBookedSlots(tenantSlug: string, dateStr: string, resourceId?: string | null): Promise<string[]> {
    const supabase = createAdminClient()

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, allow_overlap')
        .eq('slug', tenantSlug)
        .maybeSingle()

    if (!tenant || tenant.allow_overlap) return []

    const dayStart = new Date(`${dateStr}T00:00:00`).toISOString()
    const dayEnd = new Date(`${dateStr}T23:59:59`).toISOString()

    let query = supabase
        .from('reservations')
        .select('start_time')
        .eq('tenant_id', tenant.id)
        .not('status', 'eq', 'canceled')
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)

    if (resourceId) {
        query = query.eq('resource_id', resourceId)
    }

    const { data: reservas } = await query

    if (!reservas) return []

    return reservas.map(r => {
        const d = new Date(r.start_time)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    })
}

