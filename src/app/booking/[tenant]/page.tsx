import BookingPageClient from './booking-client'

export default async function BookingPage({
    params,
}: {
    params: Promise<{ tenant: string }>
}) {
    const { tenant } = await params

    // Aquí en el futuro (cuando la BD tenga servicios/horarios reales), 
    // Podríamos hacer un `await supabase.from('tenants').select().eq('slug', tenant)`
    // y pasar los horarios al Client Component.

    return (
        <BookingPageClient tenantSlug={tenant} />
    )
}
