-- NUEVA TABLA: REGLAS DE DISPONIBILIDAD HORARIA
-- Corre este script en el SQL Editor de Supabase para habilitar la configuración de horarios.

CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Lun, ..., 6=Sáb
  start_time TIME NOT NULL,   -- ej: '09:00'
  end_time TIME NOT NULL,     -- ej: '18:00'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seguridad: Activar RLS
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;

-- Solo el dueño del negocio puede leer y editar sus horarios
CREATE POLICY "Owners can manage their availability rules" 
ON public.availability_rules
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);
