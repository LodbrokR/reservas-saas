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

    const supabase = createAdminClient()

    // Upsert: Actualiza si ya existe, inserta si no
    const { error } = await supabase
        .from('availability_rules')
        .upsert(
            { tenant_id: tenantId, day_of_week, start_time, end_time, is_active },
            { onConflict: 'tenant_id,day_of_week' }
        )

    if (error) return { error: `Error guardando horario: ${error.message}` }

    revalidatePath('/admin/horarios')
    return { success: true }
}
