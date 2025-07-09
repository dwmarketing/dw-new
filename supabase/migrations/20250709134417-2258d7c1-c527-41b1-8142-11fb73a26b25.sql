-- Simplify RLS policies to resolve permission denied errors
-- Remove conflicting policies and create unified ones

-- Fix subscription_events table policies
DROP POLICY IF EXISTS "Admins can view all subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Allow n8n public access on subscription_events" ON public.subscription_events;

-- Create unified policy for subscription_events
CREATE POLICY "Allow admin access and n8n access to subscription_events" 
ON public.subscription_events 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Fix subscription_status table policies  
DROP POLICY IF EXISTS "Admins can view all subscription status" ON public.subscription_status;
DROP POLICY IF EXISTS "Allow n8n public access on subscription_status" ON public.subscription_status;

-- Create unified policy for subscription_status
CREATE POLICY "Allow admin access and n8n access to subscription_status"
ON public.subscription_status
FOR ALL
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Fix subscription_renewals table - it currently has no insert/update policies
DROP POLICY IF EXISTS "Admins can view all subscription renewals" ON public.subscription_renewals;

-- Create unified policy for subscription_renewals
CREATE POLICY "Allow admin full access to subscription_renewals"
ON public.subscription_renewals
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix creative_insights table policies
DROP POLICY IF EXISTS "Admins can view all creative insights" ON public.creative_insights;
DROP POLICY IF EXISTS "Allow n8n public access on creative_insights" ON public.creative_insights;

-- Create unified policy for creative_insights
CREATE POLICY "Allow admin access and n8n access to creative_insights"
ON public.creative_insights
FOR ALL  
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Fix creative_sales table policies
DROP POLICY IF EXISTS "Admins can view all creative sales" ON public.creative_sales;
DROP POLICY IF EXISTS "Allow n8n public access on creative_sales" ON public.creative_sales;
DROP POLICY IF EXISTS "Permitir insert para todos" ON public.creative_sales;

-- Create unified policy for creative_sales
CREATE POLICY "Allow admin access and n8n access to creative_sales"
ON public.creative_sales
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Fix product_sales table policies
DROP POLICY IF EXISTS "Admins can view all product sales" ON public.product_sales;
DROP POLICY IF EXISTS "Allow n8n public access on product_sales" ON public.product_sales;

-- Create unified policy for product_sales
CREATE POLICY "Allow admin access and n8n access to product_sales"
ON public.product_sales
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Fix business_manager_accounts table policies
DROP POLICY IF EXISTS "Admins can view all business manager accounts" ON public.business_manager_accounts;
DROP POLICY IF EXISTS "Allow n8n public access on business_manager_accounts" ON public.business_manager_accounts;

-- Create unified policy for business_manager_accounts
CREATE POLICY "Allow admin access and n8n access to business_manager_accounts"
ON public.business_manager_accounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);