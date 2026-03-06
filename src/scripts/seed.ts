// Script Node.js temporal para crear datos de prueba en la BD
// Para ejecutar: ts-node src/scripts/seed.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usar Service Role Key en prod para ignorar RLS en seeds

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('🌱 Iniciando seeder...')

    // 1. Crear Tenant
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
            name: 'Peluquería StyleFlow',
            slug: 'styleflow',
            ui_primary_color: '#3b82f6',
        })
        .select()
        .single()

    if (tenantError) {
        if (tenantError.code === '23505') {
            console.log('✅ El tenant ya existe, omitiendo...')
        } else {
            console.error('❌ Error creando Tenant:', tenantError)
            return
        }
    }

    if (tenant) {
        console.log('✅ Tenant creado:', tenant.name)

        // 2. Crear Recurso (Ej. Peluquero o Sillón)
        const { data: resource, error: resError } = await supabase
            .from('resources')
            .insert({
                tenant_id: tenant.id,
                name: 'Sillón Premium',
                description: 'Corte de Cabello y Barba',
                capacity: 1
            })
            .select()
            .single()

        if (resError) console.error('❌ Error creando Recurso:', resError)
        else console.log('✅ Recurso creado:', resource.name)
    }

    console.log('🎉 Seeding terminado (Simulado - No RLS auth applied yet)')
}

main()
