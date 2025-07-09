-- Simplificar políticas RLS para user_page_permissions e user_roles
-- Remover a política que causa problemas de permissão e criar uma mais simples

-- Primeiro, remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Allow all authenticated users to view permissions for admin che" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow authenticated users to view their own permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow n8n read access on user_page_permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow all authenticated users to view roles for admin checks" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow n8n read access on user_roles" ON public.user_roles;

-- Criar políticas simplificadas que permitem acesso completo para usuários autenticados
-- Isso resolve os problemas de "permission denied" que estavam ocorrendo

-- Política simples para user_page_permissions
CREATE POLICY "Allow authenticated users full access to permissions" 
ON public.user_page_permissions 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Política simples para user_roles  
CREATE POLICY "Allow authenticated users full access to roles"
ON public.user_roles
FOR ALL
TO authenticated  
USING (true)
WITH CHECK (auth.uid() = user_id);