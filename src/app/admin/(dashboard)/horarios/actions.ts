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

export async function saveAvailabilityRule(formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'Sin permisos.' }

    const day_of_week = parseInt(formData.get('day_of_week') as string)
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const is_active = formData.get('is_active') === 'true'
    const resource_id = formData.get('resource_id') as string | null

    const supabase = createAdminClient()

    // Como la clave única original podía no contemplar resource_id, hacemos select + insert/update manuales
    let query = supabase.from('availability_rules').select('id').eq('tenant_id', tenantId).eq('day_of_week', day_of_week)
    if (resource_id) {
        query = query.eq('resource_id', resource_id)
    } else {
        query = query.is('resource_id', null)
    }

    const { data: existing } = await query.maybeSingle()

    let error;
    if (existing) {
        // Update
        const res = await supabase.from('availability_rules')
            .update({ start_time, end_time, is_active })
            .eq('id', existing.id)
        error = res.error
    } else {
        // Insert
        const res = await supabase.from('availability_rules')
            .insert({ tenant_id: tenantId, day_of_week, start_time, end_time, is_active, resource_id: resource_id || null })
        error = res.error
    }

    if (error) return { error: `Error guardando horario: ${error.message}` }

    revalidatePath('/admin/horarios')
    return { success: true }
}
