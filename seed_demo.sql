-- IMPORTAR DATOS MOCK DE RESERVAS (Vía SQL para evitar conflictos RLS iniciales de prueba)
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE PARA VER CLIENTES EN LA INTRANET.

-- Insertamos el primer negocio (Tenant)
INSERT INTO public.tenants (name, slug, ui_primary_color)
VALUES ('Peluquería StyleFlow', 'styleflow', '#3b82f6')
ON CONFLICT (slug) DO NOTHING;

-- Obtenemos el ID del negocio recien creado para el resto de inserciones
DO $$
DECLARE
    t_id UUID;
    r_id UUID;
    c1_id UUID;
    c2_id UUID;
BEGIN
    SELECT id INTO t_id FROM public.tenants WHERE slug = 'styleflow';

    -- Insertamos recurso (Sillon)
    INSERT INTO public.resources (tenant_id, name, description, capacity)
    VALUES (t_id, 'Sillón Premium', 'Corte de Cabello y Barba', 1)
    RETURNING id INTO r_id;

    -- Insertamos clientes
    INSERT INTO public.customers (tenant_id, full_name, email, phone)
    VALUES (t_id, 'Roberto Gómez', 'roberto.g@mail.com', '+56912345678')
    RETURNING id INTO c1_id;

    INSERT INTO public.customers (tenant_id, full_name, email, phone)
    VALUES (t_id, 'Ana Belén Ríos', 'ana.rios@empresa.cl', '+56987654321')
    RETURNING id INTO c2_id;

    -- Insertamos Reservas
    INSERT INTO public.reservations (tenant_id, resource_id, customer_id, start_time, end_time, status, payment_status, total_price)
    VALUES 
    (t_id, r_id, c1_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 'confirmed', 'paid', 15000),
    (t_id, r_id, c2_id, NOW() + INTERVAL '2 day', NOW() + INTERVAL '2 day 1 hour', 'pending', 'unpaid', 25000);

END $$;
