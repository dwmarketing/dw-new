-- Garantir que admins tenham acesso completo às tabelas principais
-- Política para user_roles - admins podem ver e editar todas as roles
CREATE POLICY IF NOT EXISTS "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para user_page_permissions - admins podem ver e editar todas as permissões
CREATE POLICY IF NOT EXISTS "Admins can manage all user permissions" 
ON public.user_page_permissions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para creative_insights - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all creative insights" 
ON public.creative_insights 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para creative_sales - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all creative sales" 
ON public.creative_sales 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para subscription_events - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all subscription events" 
ON public.subscription_events 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para subscription_status - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all subscription status" 
ON public.subscription_status 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para subscription_renewals - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all subscription renewals" 
ON public.subscription_renewals 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Política para product_sales - admins podem ver todos os dados
CREATE POLICY IF NOT EXISTS "Admins can view all product sales" 
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
CREATE POLICY IF NOT EXISTS "Admins can view all business manager accounts" 
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
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" 
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