'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function setupTenant(formData: FormData) {
    const supabaseSession = await createClient() // Para verificar el User
    const supabaseAdmin = createAdminClient()    // Para insertar la Base (Bypass RLS)

    // 1. Validar que el usuario esté logeado (Debe ser el "Dueño" inicial)
    const { data: { user } } = await supabaseSession.auth.getUser()

    // Para entornos de Demo relajados (Bypass si no hay Login estricto por ahora)
    // if (!user) return { error: 'Debes iniciar sesión primero para reclamar un negocio.' }

    const negocioName = formData.get('negocioName') as string
    const rubro = formData.get('rubro') as string

    if (!negocioName || !rubro) return { error: 'Faltan datos obligatorios del formulario.' }

    // --- BLOQUEO MULTI-TENANT ---
    // En esta versión MVP, un usuario solo puede ser dueño de 1 Negocio.
    if (user) {
        const { data: alreadyHasTenant } = await supabaseAdmin
            .from('tenant_users')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

        if (alreadyHasTenant && alreadyHasTenant.length > 0) {
            return { error: 'Tu correo ya administra un Negocio. No puedes tener más de uno por cuenta.' }
        }
    }

    // Convertir nombre a Slug (ej: "Mi Peluquería" -> "mi-peluqueria")
    const slug = negocioName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    try {
        // 2. Buscar o Crear el Tenant (Idempotente)
        let tenantId = null;

        // Intentar buscar si el Tenant ya existe (caso de fallos a la mitad)
        const { data: existingTenant } = await supabaseAdmin
            .from('tenants')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (existingTenant) {
            tenantId = existingTenant.id;
        } else {
            // Si no existe, crearlo fresco
            const { data: newTenant, error: tenantErr } = await supabaseAdmin
                .from('tenants')
                .insert({
                    name: negocioName,
                    slug: slug
                })
                .select('id')
                .single()

            if (tenantErr) return { error: `Error creando negocio: ${tenantErr.message}. Prueba con un nombre distinto.` }
            tenantId = newTenant.id;
        }

        // 3. Crear el primer "Recurso" (Ej: Sillón o Box)
        const recursoBase = rubro === 'peluqueria' ? 'Sillón Principal' :
            rubro === 'clinica' ? 'Box Médico 1' :
                'Recurso Primario'

        // Verificar si el recurso principal existe primero
        const { data: existingResource } = await supabaseAdmin
            .from('resources')
            .select('id')
            .eq('tenant_id', tenantId)
            .maybeSingle()

        if (!existingResource) {
            const { error: resErr } = await supabaseAdmin
                .from('resources')
                .insert({
                    tenant_id: tenantId,
                    name: recursoBase
                })

            if (resErr) return { error: `Error creando recursos: ${resErr.message}` }
        }

        // 4. (Opcional Futuro) Auto-Poblar Servicios Base en la BD
        // Aquí insertaríamos en una tabla "services" (Corte de Pelo, Lavado, Consulta Dental, etc.)

        // 5. Vincular al usuario (si no estaba ya vinculado)
        if (user) {
            const { data: existingUserLink } = await supabaseAdmin
                .from('tenant_users')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('user_id', user.id)
                .maybeSingle()

            if (!existingUserLink) {
                await supabaseAdmin.from('tenant_users').insert({
                    tenant_id: tenantId,
                    user_id: user.id,
                    role: 'owner'
                })
            }
        }

        revalidatePath('/admin')
        return { success: true, slug: slug }

    } catch (e: any) {
        return { error: `Error Crítico: ${e.message}` }
    }
}
