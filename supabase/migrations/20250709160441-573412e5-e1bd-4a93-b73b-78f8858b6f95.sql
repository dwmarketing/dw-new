-- Fix RLS policy on user_roles table to allow admins to manage roles for other users
DROP POLICY IF EXISTS "Unified access policy for user_roles" ON public.user_roles;

-- Create new RLS policy that allows admins to manage any user's roles
-- while regular users can only view/manage their own roles
CREATE POLICY "Enhanced access policy for user_roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));