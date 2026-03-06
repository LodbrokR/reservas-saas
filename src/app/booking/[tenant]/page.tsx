import BookingPageClient from './booking-client'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function BookingPage({
    params,
}: {
    params: Promise<{ tenant: string }>
}) {
    const { tenant } = await params
    const supabase = await createClient()

    // Cargar datos reales del Tenant por Slug
    const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, name, slug, ui_primary_color')
        .eq('slug', tenant)
        .maybeSingle()

    if (!tenantData) return notFound()

    // Cargar los Servicios/Recursos reales de este negocio
    const { data: resources } = await supabase
        .from('resources')
        .select('id, name, description')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: true })

    // Cargar las reglas de disponibilidad horaria
    const { data: availability } = await supabase
        .from('availability_rules')
        .select('day_of_week, start_time, end_time, is_active')
        .eq('tenant_id', tenantData.id)
        .eq('is_active', true)

    return (
        <BookingPageClient
            tenantSlug={tenant}
            tenantName={tenantData.name}
            tenantColor={tenantData.ui_primary_color || '#000000'}
            services={resources || []}
            availability={availability || []}
        />
    )
}
