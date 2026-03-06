import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TenantInfoForm, ResourcesManager } from './components'

export const metadata = {
    title: 'Ajustes del Negocio | Admin',
}

export default async function ConfiguracionPage() {
    const supabase = await createClient()

    // Obtener el usuario y su tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!tenantUser) redirect('/setup')

    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, slug, ui_primary_color')
        .eq('id', tenantUser.tenant_id)
        .single()

    const { data: resources } = await supabase
        .from('resources')
        .select('id, name, description')
        .eq('tenant_id', tenantUser.tenant_id)
        .order('created_at', { ascending: true })

    if (!tenant) return <div>Error cargando el negocio.</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ajustes del Negocio</h1>
                <p className="text-muted-foreground mt-1">
                    Personaliza los datos públicos y servicios de <strong>{tenant.name}</strong>.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <TenantInfoForm tenant={tenant} />
                <ResourcesManager resources={resources || []} />
            </div>
        </div>
    )
}
