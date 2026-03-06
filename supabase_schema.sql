-- SCHEMA BASICO DEL SAAS DE RESERVAS (Supabase)
-- ESTE SCRIPT PUEDE CORRERSE EN EL SQL EDITOR DE SUPABASE PARA INICIAR EL REPO.

-- 1. Tabla de Tenants (Negocios Clientes)
CREATE TABLE public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- ej. 'mi-peluqueria' (usado en la URL)
  ui_primary_color TEXT DEFAULT '#000000',
  ui_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Usuarios Autorizados en el Dashboard (Staff del Negocio)
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' -- admin, staff
);

-- 3. Tabla de Recursos a Reservar (ej. "Cancha 1", "Mesa 5", "Dr. Pérez")
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRM / Clientes Finales del Negocio
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email) -- El mismo correo puede ser cliente de 2 tenants distintos sin estorbarse
);

-- 5. Tabla de Reservas Transaccional
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'canceled', 'completed');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');

CREATE TABLE public.reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status reservation_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'unpaid',
  payment_transaction_id TEXT, -- Preparado para integracion Transbank/Flow
  total_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- SUPER ROW LEVEL SECURITY (RLS) PARA AISLAMIENTO
-----------------------------------------------------

-- Activar RLS en todas las tablas transaccionales
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Politica: El usuario solo puede ver datos del Tenant al cual pertenece en el Dashboard
CREATE POLICY "Users can only select data from their tenant" ON public.resources 
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only insert data into their tenant" ON public.resources 
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid()
  )
);

-- Las politicas anteriores se replicarian para Reservations y Customers
-- Para este archivo inicial dejaremos estas plantillas.
