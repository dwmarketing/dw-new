
-- Primeiro, remover as tabelas existentes (cuidado: isso apagará todos os dados!)
DROP TABLE IF EXISTS public.user_chart_permissions CASCADE;
DROP TABLE IF EXISTS public.user_page_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover os tipos personalizados existentes
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.page CASCADE;
DROP TYPE IF EXISTS public.chart_type CASCADE;

-- Recriar os tipos ENUM necessários
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'business_manager');

CREATE TYPE public.page AS ENUM (
  'dashboard',
  'settings',
  'analytics', 
  'billing',
  'creatives',
  'sales',
  'affiliates',
  'revenue',
  'users',
  'business-managers',
  'subscriptions'
);

CREATE TYPE public.chart_type AS ENUM (
  'kpi_total_investido',
  'kpi_receita',
  'kpi_ticket_medio',
  'kpi_total_pedidos',
  'creative_performance_chart',
  'creative_sales_chart',
  'sales_summary_cards',
  'sales_chart',
  'country_sales_chart',
  'state_sales_chart',
  'affiliate_chart',
  'subscription_renewals_chart',
  'subscription_status_chart',
  'new_subscribers_chart'
);

-- Recriar a tabela profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  PRIMARY KEY (id)
);

-- Recriar a tabela user_roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  PRIMARY KEY (id),
  UNIQUE (user_id, role)
);

-- Recriar a tabela user_page_permissions
CREATE TABLE public.user_page_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page public.page NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE (user_id, page)
);

-- Recriar a tabela user_chart_permissions
CREATE TABLE public.user_chart_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_type public.chart_type NOT NULL,
  page TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  PRIMARY KEY (id),
  UNIQUE (user_id, chart_type)
);

-- Recriar a função has_role (essencial para RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recriar a função handle_new_user para triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Assign default page permissions
  INSERT INTO public.user_page_permissions (user_id, page, can_access)
  VALUES 
    (NEW.id, 'dashboard', true),
    (NEW.id, 'settings', true);
  
  RETURN NEW;
END;
$$;

-- Recriar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = (now() AT TIME ZONE 'America/Sao_Paulo');
  RETURN NEW;
END;
$$;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view and update their own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow service role full access to profiles"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow service role full access to user_roles"
  ON public.user_roles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para user_page_permissions
CREATE POLICY "Users can view their own page permissions"
  ON public.user_page_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all page permissions"
  ON public.user_page_permissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow service role full access to user_page_permissions"
  ON public.user_page_permissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para user_chart_permissions
CREATE POLICY "Users can view their own chart permissions"
  ON public.user_chart_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chart permissions"
  ON public.user_chart_permissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow service role full access to user_chart_permissions"
  ON public.user_chart_permissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_chart_permissions_updated_at
  BEFORE UPDATE ON public.user_chart_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_page_permissions_user_id ON public.user_page_permissions(user_id);
CREATE INDEX idx_user_page_permissions_page ON public.user_page_permissions(page);
CREATE INDEX idx_user_chart_permissions_user_id ON public.user_chart_permissions(user_id);
CREATE INDEX idx_user_chart_permissions_chart_type ON public.user_chart_permissions(chart_type);
