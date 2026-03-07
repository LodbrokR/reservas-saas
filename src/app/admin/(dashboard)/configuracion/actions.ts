'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// Obtener el tenant_id del usuario actual
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

// Actualizar datos del negocio
export async function updateTenantInfo(formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'No tienes permisos para esta acción.' }

    const name = formData.get('name') as string
    const color = formData.get('ui_primary_color') as string

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('tenants')
        .update({ name, ui_primary_color: color })
        .eq('id', tenantId)

    if (error) return { error: `Error actualizando negocio: ${error.message}` }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// Guardar el número de WhatsApp y la API key de CallMeBot
export async function updateWhatsApp(formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'No tienes permisos para esta acción.' }

    const whatsapp_number = formData.get('whatsapp_number') as string
    const whatsapp_api_key = formData.get('whatsapp_api_key') as string

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('tenants')
        .update({ whatsapp_number, whatsapp_api_key })
        .eq('id', tenantId)

    if (error) return { error: `Error guardando WhatsApp: ${error.message}` }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// Actualizar la política de reservas simultáneas
export async function updateBookingPolicy(formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'No tienes permisos para esta acción.' }

    const allow_overlap = formData.get('allow_overlap') === 'true'

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('tenants')
        .update({ allow_overlap })
        .eq('id', tenantId)

    if (error) return { error: `Error guardando política: ${error.message}` }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// Agregar un nuevo servicio/recurso
export async function addResource(formData: FormData) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'No tienes permisos para esta acción.' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return { error: 'El nombre del servicio es obligatorio.' }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('resources')
        .insert({ tenant_id: tenantId, name, description })

    if (error) return { error: `Error creando servicio: ${error.message}` }

    revalidatePath('/admin/configuracion')
    return { success: true }
}

// Eliminar un servicio/recurso
export async function deleteResource(resourceId: string) {
    const tenantId = await getCurrentTenantId()
    if (!tenantId) return { error: 'No tienes permisos.' }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('tenant_id', tenantId) // Doble seguridad: solo borra los suyos

    if (error) return { error: `Error eliminando servicio: ${error.message}` }

    revalidatePath('/admin/configuracion')
    return { success: true }
}
