-- PERMISOS PARA EL PANEL ADMINISTRATIVO (Intranet)
-- Ya que eres el administrador del sistema, necesitamos que tu usuario
-- autenticado pueda leer las reservas que acaban de entrar.

CREATE POLICY "Admin puede ver reservas" ON public.reservations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede ver clientes" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede ver recursos" ON public.resources FOR SELECT USING (auth.role() = 'authenticated');
