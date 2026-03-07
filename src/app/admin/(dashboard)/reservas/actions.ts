'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

async function getCurrentTenantId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle()
    return data?.tenant_id ?? null
}

// Actualizar fecha y hora de una reserva
export async function updateReservationTime(reservationId: string, formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'Sin permisos.' }

    const dateStr = formData.get('date') as string   // YYYY-MM-DD
    const timeStr = formData.get('time') as string   // HH:MM
    const duration = parseInt(formData.get('duration') as string || '30')

    const startTime = new Date(`${dateStr}T${timeStr}:00`)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('reservations')
        .update({
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
        })
        .eq('id', reservationId)
        .eq('tenant_id', tenantId)  // Seguridad: solo modifica las suyas

    if (error) return { error: `Error actualizando horario: ${error.message}` }

    revalidatePath('/admin/reservas')
    return { success: true }
}

// Actualizar datos de contacto del cliente de una reserva
export async function updateCustomerData(customerId: string, formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'Sin permisos.' }

    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('customers')
        .update({ full_name, email, phone })
        .eq('id', customerId)
        .eq('tenant_id', tenantId)

    if (error) return { error: `Error actualizando cliente: ${error.message}` }

    revalidatePath('/admin/reservas')
    revalidatePath('/admin/clientes')
    return { success: true }
}

// Cambiar el estado de una reserva (confirmar, cancelar, completar)
export async function updateReservationStatus(reservationId: string, status: string) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'Sin permisos.' }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .eq('tenant_id', tenantId)

    if (error) return { error: `Error cambiando estado: ${error.message}` }

    revalidatePath('/admin/reservas')
    return { success: true }
}

// Eliminar una reserva permanentemente
export async function deleteReservation(reservationId: string) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'Sin permisos.' }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId)
        .eq('tenant_id', tenantId)  // Seguridad: solo borra las suyas

    if (error) return { error: `Error eliminando reserva: ${error.message}` }

    revalidatePath('/admin/reservas')
    return { success: true }
}
