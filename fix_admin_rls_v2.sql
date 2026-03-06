-- REPARACIÓN CRÍTICA DE SEGURIDAD (V2)
-- 
-- El script anterior (fix_admin_rls) concedió permiso a CUALQUIER USUARIO
-- autenticado para leer la base de datos completa.
-- Este script restablecerá la seguridad aislando estrictamente los datos para que
-- el dueño de la Peluquería solo vea su Peluquería.

-- 1. Eliminar políticas globales inseguras
DROP POLICY IF EXISTS "Admin puede ver reservas" ON public.reservations;
DROP POLICY IF EXISTS "Admin puede ver clientes" ON public.customers;
DROP POLICY IF EXISTS "Admin puede ver recursos" ON public.resources;

-- 2. Restaurar Políticas Restrictivas Multi-Tenant
CREATE POLICY "Users can see their own tenant reservations" ON public.reservations
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can see their own tenant customers" ON public.customers
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can see their own tenant resources" ON public.resources
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);
