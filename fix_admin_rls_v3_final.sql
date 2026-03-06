-- REPARACIÓN DEFINITIVA DE SEGURIDAD Y ENLACES (V3)
-- 
-- 1. CORRECCIÓN DEL BUCLE INFINITO DEL SETUP WIZARD
-- El login enviaba constantemente al usuario al /setup porque la tabla
-- `tenant_users` no le permitía al dueño leer su propia membresía.
CREATE POLICY "Users can read their own tenant memberships" ON public.tenant_users
FOR SELECT USING (id = auth.uid());

-- 2. BLOQUEO DEFINITIVO DE FUGA DE CLIENTES B2B
-- En la versión anterior de pruebas dejamos que la web B2C validara 
-- clientes públicamente. Eso hace que el dashboard mezcle todo.
DROP POLICY IF EXISTS "Public can view customers" ON public.customers;

-- Ahora solo los dueños pueden ver a sus propios clientes en la BD:
-- (Asegurándonos de que esté activa la regla que creamos en V2)
DROP POLICY IF EXISTS "Users can see their own tenant customers" ON public.customers;
CREATE POLICY "Users can see their own tenant customers" ON public.customers
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);
