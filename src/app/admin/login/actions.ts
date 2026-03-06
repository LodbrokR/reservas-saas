'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Faltan credenciales' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // --- MAGIA SAAS: VERIFICAR SI ESTE USUARIO TIENE UN NEGOCIO ---
    const { data: userTenant } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

    // Si no tiene negocio, lo mandamos al Asistente de Instalación
    if (!userTenant) {
        revalidatePath('/setup', 'layout')
        redirect('/setup')
    }

    // Si ya tiene negocio, entra a su Intranet Admin
    revalidatePath('/admin', 'layout')
    redirect('/admin')
}

export async function logout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/admin/login')
}
