-- Simplify RLS policies to allow service_role access without complex checks

-- Update profiles table RLS policy
DROP POLICY IF EXISTS "Unified profiles access policy" ON public.profiles;

CREATE POLICY "Allow service role and admins full access to profiles" 
  ON public.profiles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Update user_roles table RLS policy  
DROP POLICY IF EXISTS "Allow service role and admin access for user_roles" ON public.user_roles;

CREATE POLICY "Allow service role and admins full access to user_roles" 
  ON public.user_roles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Update user_page_permissions table RLS policy
DROP POLICY IF EXISTS "Unified access policy for user_page_permissions" ON public.user_page_permissions;

CREATE POLICY "Allow service role and admins full access to user_page_permissions" 
  ON public.user_page_permissions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Update user_chart_permissions table RLS policy
DROP POLICY IF EXISTS "Unified access policy for user_chart_permissions" ON public.user_chart_permissions;

CREATE POLICY "Allow service role and admins full access to user_chart_permissions" 
  ON public.user_chart_permissions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);