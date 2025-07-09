-- Fix critical RLS policy conflicts causing permission denied errors

-- Fix profiles table policies (most critical)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow n8n read access on profiles" ON public.profiles;

-- Create unified policy for profiles
CREATE POLICY "Allow admin and user access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = id OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = id);