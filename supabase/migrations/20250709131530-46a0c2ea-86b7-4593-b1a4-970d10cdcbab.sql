-- Fix RLS policies to avoid circular dependencies

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_page_permissions;

-- Create simpler policies for user_roles that don't cause circular dependencies
CREATE POLICY "Allow authenticated users to view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view roles for admin checks" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert their own roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create simpler policies for user_page_permissions
CREATE POLICY "Allow authenticated users to view their own permissions" 
ON public.user_page_permissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view permissions for admin checks" 
ON public.user_page_permissions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert their own permissions" 
ON public.user_page_permissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own permissions" 
ON public.user_page_permissions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own permissions" 
ON public.user_page_permissions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);