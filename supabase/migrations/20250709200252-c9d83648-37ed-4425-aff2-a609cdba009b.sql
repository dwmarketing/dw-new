-- Fix profiles table structure and constraints
-- First drop the existing foreign key constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the foreign key constraint with CASCADE delete
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure profiles table has proper RLS that allows service role access
DROP POLICY IF EXISTS "Allow service role and admins full access to profiles" ON public.profiles;

CREATE POLICY "Allow service role and admins full access to profiles"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- Same for user_roles table to ensure service role can manage it
DROP POLICY IF EXISTS "Allow service role and admins full access to user_roles" ON public.user_roles;

CREATE POLICY "Allow service role and admins full access to user_roles"
ON public.user_roles
FOR ALL
USING (true)
WITH CHECK (true);

-- Same for user_page_permissions
DROP POLICY IF EXISTS "Allow service role and admins full access to user_page_permissi" ON public.user_page_permissions;

CREATE POLICY "Allow service role and admins full access to user_page_permissions"
ON public.user_page_permissions
FOR ALL
USING (true)
WITH CHECK (true);

-- Same for user_chart_permissions
DROP POLICY IF EXISTS "Allow service role and admins full access to user_chart_permiss" ON public.user_chart_permissions;

CREATE POLICY "Allow service role and admins full access to user_chart_permissions"
ON public.user_chart_permissions
FOR ALL
USING (true)
WITH CHECK (true);