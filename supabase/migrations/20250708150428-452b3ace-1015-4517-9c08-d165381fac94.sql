-- Continuar configurando políticas para outras tabelas e criar permissões de página

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

-- Criar todas as permissões de página para o usuário admin existente
INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT ur.user_id, page_name::public.page, true
FROM public.user_roles ur
CROSS JOIN (
  VALUES 
    ('dashboard'),
    ('creatives'),
    ('sales'),
    ('affiliates'), 
    ('revenue'),
    ('users'),
    ('business-managers'),
    ('subscriptions'),
    ('settings'),
    ('analytics'),
    ('billing')
) AS pages(page_name)
WHERE ur.role = 'admin'
ON CONFLICT (user_id, page) DO UPDATE SET can_access = true;