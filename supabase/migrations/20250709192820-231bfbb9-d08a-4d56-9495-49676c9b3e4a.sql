-- Fix RLS policies to allow create-user edge function to work properly

-- Update profiles table RLS policy to allow service role and admins to create profiles for other users
DROP POLICY IF EXISTS "Unified profiles access policy" ON public.profiles;

CREATE POLICY "Unified profiles access policy" 
  ON public.profiles 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = id) OR true)
  WITH CHECK (
    (current_setting('role'::text) = 'service_role'::text) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    (auth.uid() = id)
  );

-- Update user_page_permissions table RLS policy to allow service role and admins to create permissions for other users
DROP POLICY IF EXISTS "Unified access policy for user_page_permissions" ON public.user_page_permissions;

CREATE POLICY "Unified access policy for user_page_permissions" 
  ON public.user_page_permissions 
  FOR ALL 
  USING (true)
  WITH CHECK (
    (current_setting('role'::text) = 'service_role'::text) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    (auth.uid() = user_id)
  );

-- Update user_chart_permissions table RLS policy to allow service role and admins to create permissions for other users
DROP POLICY IF EXISTS "Unified access policy for user_chart_permissions" ON public.user_chart_permissions;

CREATE POLICY "Unified access policy for user_chart_permissions" 
  ON public.user_chart_permissions 
  FOR ALL 
  USING (true)
  WITH CHECK (
    (current_setting('role'::text) = 'service_role'::text) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    (auth.uid() = user_id)
  );