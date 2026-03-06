'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createReservation(
    tenantSlug: string,
    serviceName: string,
    date: Date,
    timeStr: string,
    customerData: { fullName: string; email: string; phone: string }
) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de Vercel.' }
        }

        const supabase = createAdminClient()

        // 1. Obtener ID del Tenant
        const { data: tenant, error: tenantErr } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', tenantSlug)
            .single()

        if (tenantErr || !tenant) {
            return { error: `Negocio no encontrado. Detalles: ${tenantErr?.message || 'No existe'}` }
        }

        // 2. Obtener el primer recurso disponible (Asumiremos que el Tenant tiene 1 recurso base por ahora en el MVP)
        const { data: resource, error: resErr } = await supabase
            .from('resources')
            .select('id')
            .eq('tenant_id', tenant.id)
            .limit(1)
            .single()

        if (resErr || !resource) {
            return { error: `Sin recursos. Detalles: ${resErr?.message || 'Ninguno'}` }
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

        // 5. Insertar la Reserva
        const { error: reserveErr } = await supabase
            .from('reservations')
            .insert({
                tenant_id: tenant.id,
                resource_id: resource.id,
                customer_id: customerId,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                status: 'confirmed', // Asumido por ahora
                payment_status: 'unpaid'
            })

        if (reserveErr) {
            console.error("Booking Error:", reserveErr)
            return { error: reserveErr.message || 'Ese horario posiblemente ya está ocupado o hubo un error al guardar la reserva.' }
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
