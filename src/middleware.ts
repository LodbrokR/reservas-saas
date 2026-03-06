import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Refrescar sesión de Supabase si existe
    const { supabaseResponse, user } = await updateSession(request)

    const url = request.nextUrl
    const hostname = request.headers.get('host') || ''

    // 2. Lógica Multi-Tenant Básica
    // Extraemos el subdominio si lo hay (ej. miempresa.reservas-saas.cl)
    // O bien operamos por rutas (ej. /book/miempresa)

    // Ignoramos rutas estáticas de Next.js y assets
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('.')
    ) {
        return supabaseResponse
    }

    // Si estamos navegando en el Dashboard Administrativo
    if (url.pathname.startsWith('/admin')) {
        if (!user && url.pathname !== '/admin/login') {
            // Redirigir a login si no hay sesión
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        return supabaseResponse
    }

    // Ignorar rutas del sistema como /setup de ser tratadas como nombre de negocio
    if (url.pathname !== '/' && !url.pathname.startsWith('/booking') && !url.pathname.startsWith('/setup')) {
        const tenantSlug = url.pathname.split('/')[1]

        // Reescribimos la URL para que Next.js use la carpeta app/booking/[tenant]/page.tsx
        return NextResponse.rewrite(new URL(`/booking/${tenantSlug}`, request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
