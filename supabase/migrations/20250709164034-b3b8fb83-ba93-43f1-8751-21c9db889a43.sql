-- Fix RLS policy for user_roles table to allow service role access
-- The edge function uses service role key which should have admin access

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enhanced access policy for user_roles" ON public.user_roles;

-- Create new policy that allows service role (used by edge functions) and admin users
CREATE POLICY "Allow service role and admin access for user_roles" 
ON public.user_roles 
FOR ALL 
USING (
  -- Allow service role (edge functions)
  current_setting('role') = 'service_role' OR
  -- Allow admin users
  has_role(auth.uid(), 'admin'::app_role) OR 
  -- Allow users to see their own roles
  (auth.uid() = user_id)
)
WITH CHECK (
  -- Allow service role (edge functions) for all operations
  current_setting('role') = 'service_role' OR
  -- Allow admin users for all operations
  has_role(auth.uid(), 'admin'::app_role)
);