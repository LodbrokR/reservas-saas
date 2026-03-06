-- SOLUCIÓN DE PERMISOS RLS (Row Level Security) PARA EL BOOKING PÚBLICO
-- Ejecuta esto en el SQL Editor de tu Supabase.

-- 1. Permitir que cualquier persona de internet pueda ver la info básica del Tenant y Recursos para reservar
CREATE POLICY "Public can view tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public can view resources" ON public.resources FOR SELECT USING (true);

-- 2. Permitir que el sistema de reservas (Widget público) pueda insertar nuevos clientes y reservas
CREATE POLICY "Public can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert reservations" ON public.reservations FOR INSERT WITH CHECK (true);

-- 3. Permitir que el sistema verifique si el correo del cliente ya existe antes de crearlo
CREATE POLICY "Public can view customers" ON public.customers FOR SELECT USING (true);
