'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setupTenant(formData: FormData) {
    const supabase = await createClient()

    // 1. Validar que el usuario esté logeado (Debe ser el "Dueño" inicial)
    const { data: { user } } = await supabase.auth.getUser()

    // Para entornos de Demo relajados (Bypass si no hay Login estricto por ahora)
    // if (!user) return { error: 'Debes iniciar sesión primero para reclamar un negocio.' }

    const negocioName = formData.get('negocioName') as string
    const rubro = formData.get('rubro') as string

    if (!negocioName || !rubro) return { error: 'Faltan datos obligatorios del formulario.' }

    // Convertir nombre a Slug (ej: "Mi Peluquería" -> "mi-peluqueria")
    const slug = negocioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    try {
        // 2. Crear el Tenant
        const { data: newTenant, error: tenantErr } = await supabase
            .from('tenants')
            .insert({
                name: negocioName,
                slug: slug,
                settings: { theme: 'system', rubro: rubro }
            })
            .select('id')
            .single()

        if (tenantErr) return { error: `Error creando negocio: ${tenantErr.message}. Quizá el nombre ya existe.` }

        // 3. Crear el primer "Recurso" (Ej: Sillón o Box)
        const recursoBase = rubro === 'peluqueria' ? 'Sillón Principal' :
            rubro === 'clinica' ? 'Box Médico 1' :
                'Recurso Primario'

        const { data: newResource, error: resErr } = await supabase
            .from('resources')
            .insert({
                tenant_id: newTenant.id,
                name: recursoBase,
                type: 'staff'
            })
            .select('id')
            .single()

        if (resErr) return { error: 'Error agregando recursos al negocio.' }

        // 4. (Opcional Futuro) Auto-Poblar Servicios Base en la BD
        // Aquí insertaríamos en una tabla "services" (Corte de Pelo, Lavado, Consulta Dental, etc.)

        // 5. Vincular al usuario logeado actual con este Tenant (Para que el Dashboard funcione)
        if (user) {
            await supabase.from('tenant_users').insert({
                tenant_id: newTenant.id,
                user_id: user.id,
                role: 'owner'
            })
        }

        revalidatePath('/admin')
        return { success: true, slug: slug }

    } catch (e: any) {
        return { error: `Error Crítico: ${e.message}` }
    }
}
