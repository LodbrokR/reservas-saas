import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TenantInfoForm, ResourcesManager, WhatsAppForm, BookingPolicyForm } from './components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        .select('name, slug, ui_primary_color, whatsapp_number, whatsapp_api_key, allow_overlap, business_type')
        .eq('id', tenantUser.tenant_id)
        .single()

    const { data: resources } = await supabase
        .from('resources')
        .select('id, name, display_name, description, capacity, resource_type')
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

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto flex justify-start">
                    <TabsTrigger value="general">Info del Negocio</TabsTrigger>
                    <TabsTrigger value="servicios">Servicios y Recursos</TabsTrigger>
                    <TabsTrigger value="otras">Otras Configuraciones</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="max-w-xl">
                    <TenantInfoForm tenant={tenant} />
                </TabsContent>

                <TabsContent value="servicios" className="max-w-2xl">
                    <ResourcesManager resources={resources || []} businessType={tenant.business_type} />
                </TabsContent>

                <TabsContent value="otras" className="max-w-2xl space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <WhatsAppForm tenant={tenant} />
                        <BookingPolicyForm tenant={tenant} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
