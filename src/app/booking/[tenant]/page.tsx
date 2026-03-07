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
        .select('id, name, slug, ui_primary_color, business_type')
        .eq('slug', tenant)
        .maybeSingle()

    if (!tenantData) return notFound()

    // Cargar los Servicios/Recursos reales de este negocio
    const { data: resources } = await supabase
        .from('resources')
        .select('id, name, display_name, description, capacity, resource_type')
        .eq('tenant_id', tenantData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

    // Cargar las reglas de disponibilidad horaria
    const { data: availability } = await supabase
        .from('availability_rules')
        .select('day_of_week, start_time, end_time, is_active, resource_id')
        .eq('tenant_id', tenantData.id)
        .eq('is_active', true)

    return (
        <BookingPageClient
            tenantSlug={tenant}
            tenantName={tenantData.name}
            tenantColor={tenantData.ui_primary_color || '#000000'}
            businessType={tenantData.business_type || 'general'}
            services={resources || []}
            availability={availability || []}
        />
    )
}
