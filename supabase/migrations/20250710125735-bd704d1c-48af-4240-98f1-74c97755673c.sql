
-- First, let's add the missing page values to match the application structure
ALTER TYPE public.page ADD VALUE IF NOT EXISTS 'ai-agents';

-- Drop and recreate the chart_type enum to include all current chart types
DROP TYPE IF EXISTS chart_type CASCADE;
CREATE TYPE chart_type AS ENUM (
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

-- Recreate the user_chart_permissions table with the new enum
DROP TABLE IF EXISTS user_chart_permissions CASCADE;
CREATE TABLE public.user_chart_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chart_type chart_type NOT NULL,
  page TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, chart_type, page)
);

-- Enable RLS on user_chart_permissions
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_chart_permissions
CREATE POLICY "Admins can manage all chart permissions" 
  ON public.user_chart_permissions 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow service role full access to user_chart_permissions" 
  ON public.user_chart_permissions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own chart permissions" 
  ON public.user_chart_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Update existing user_page_permissions to match the application structure
-- First, let's clean up the existing permissions and set them correctly
DELETE FROM public.user_page_permissions;

-- Add default permissions for all existing users
INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'dashboard',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'ai-agents',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'creatives',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'sales',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'affiliates',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'subscriptions',
  true
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'settings',
  true
FROM public.profiles p;

-- Only admins should have access to users and business-managers by default
INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'users',
  has_role(p.id, 'admin'::app_role)
FROM public.profiles p;

INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  p.id,
  'business-managers',
  has_role(p.id, 'admin'::app_role)
FROM public.profiles p;

-- Add default chart permissions for all users (all charts visible by default except for admin-only pages)
INSERT INTO public.user_chart_permissions (user_id, chart_type, page, can_view)
SELECT 
  p.id,
  chart_type::chart_type,
  'dashboard',
  true
FROM public.profiles p,
(VALUES 
  ('kpi_total_investido'),
  ('kpi_receita'),
  ('kpi_ticket_medio'),
  ('kpi_total_pedidos')
) AS charts(chart_type);

INSERT INTO public.user_chart_permissions (user_id, chart_type, page, can_view)
SELECT 
  p.id,
  chart_type::chart_type,
  'creatives',
  true
FROM public.profiles p,
(VALUES 
  ('creative_performance_chart'),
  ('creative_sales_chart')
) AS charts(chart_type);

INSERT INTO public.user_chart_permissions (user_id, chart_type, page, can_view)
SELECT 
  p.id,
  chart_type::chart_type,
  'sales',
  true
FROM public.profiles p,
(VALUES 
  ('sales_summary_cards'),
  ('sales_chart'),
  ('country_sales_chart'),
  ('state_sales_chart')
) AS charts(chart_type);

INSERT INTO public.user_chart_permissions (user_id, chart_type, page, can_view)
SELECT 
  p.id,
  chart_type::chart_type,
  'affiliates',
  true
FROM public.profiles p,
(VALUES 
  ('affiliate_chart')
) AS charts(chart_type);

INSERT INTO public.user_chart_permissions (user_id, chart_type, page, can_view)
SELECT 
  p.id,
  chart_type::chart_type,
  'subscriptions',
  true
FROM public.profiles p,
(VALUES 
  ('subscription_renewals_chart'),
  ('subscription_status_chart'),
  ('new_subscribers_chart')
) AS charts(chart_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_user_chart_permissions_updated_at
  BEFORE UPDATE ON public.user_chart_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
