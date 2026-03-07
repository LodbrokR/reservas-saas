import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import HorariosClient from './client'

export const metadata = { title: 'Horarios de Atención | Admin' }

export default async function HorariosPage() {
    const supabase = await createClient()

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
        .select('business_type')
        .eq('id', tenantUser.tenant_id)
        .single()

    const { data: resources } = await supabase
        .from('resources')
        .select('id, name, display_name, resource_type')
        .eq('tenant_id', tenantUser.tenant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

    const { data: rules } = await supabase
        .from('availability_rules')
        .select('day_of_week, start_time, end_time, is_active, resource_id')
        .eq('tenant_id', tenantUser.tenant_id)
        .order('day_of_week', { ascending: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Horarios de Atención</h1>
                <p className="text-muted-foreground mt-1">
                    Define los días y horas en que tu negocio está disponible para recibir reservas.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Disponibilidad Semanal
                    </CardTitle>
                    <CardDescription>
                        Activa o desactiva cada día y establece el rango horario. Los clientes solo podrán agendar en los bloques activos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HorariosClient
                        rules={(rules || []) as any}
                        resources={(resources || []) as any}
                        businessType={tenant?.business_type || 'general'}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
