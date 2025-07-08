-- Continuar configurando políticas para outras tabelas

-- Política para product_sales - admins podem ver todos os dados
DROP POLICY IF EXISTS "Admins can view all product sales" ON public.product_sales;
CREATE POLICY "Admins can view all product sales" 
ON public.product_sales 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para business_manager_accounts - admins podem ver todos os dados
DROP POLICY IF EXISTS "Admins can view all business manager accounts" ON public.business_manager_accounts;
CREATE POLICY "Admins can view all business manager accounts" 
ON public.business_manager_accounts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para profiles - admins podem ver todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Criar todas as permissões de página para usuários admin existentes
-- Usamos WHERE NOT EXISTS para evitar duplicatas
DO $$
DECLARE
    admin_user_id uuid;
    page_name text;
    pages text[] := ARRAY['dashboard', 'creatives', 'sales', 'affiliates', 'revenue', 'users', 'business-managers', 'subscriptions', 'settings', 'analytics', 'billing'];
BEGIN
    -- Para cada usuário admin
    FOR admin_user_id IN 
        SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'
    LOOP
        -- Para cada página
        FOREACH page_name IN ARRAY pages
        LOOP
            -- Inserir permissão se não existir
            INSERT INTO public.user_page_permissions (user_id, page, can_access)
            SELECT admin_user_id, page_name::public.page, true
            WHERE NOT EXISTS (
                SELECT 1 FROM public.user_page_permissions upp 
                WHERE upp.user_id = admin_user_id AND upp.page = page_name::public.page
            );
            
            -- Atualizar se já existir
            UPDATE public.user_page_permissions 
            SET can_access = true 
            WHERE user_id = admin_user_id AND page = page_name::public.page;
        END LOOP;
    END LOOP;
END $$;