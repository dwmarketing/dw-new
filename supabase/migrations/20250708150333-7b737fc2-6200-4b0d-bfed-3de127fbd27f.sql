-- Garantir que admins tenham acesso completo às tabelas principais
-- Primeiro remover políticas existentes para recriar com privilégios admin

-- Política para user_roles - admins podem ver e editar todas as roles
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles" 
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
DROP POLICY IF EXISTS "Admins can manage all user permissions" ON public.user_page_permissions;
CREATE POLICY "Admins can manage all user permissions" 
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
DROP POLICY IF EXISTS "Admins can view all creative insights" ON public.creative_insights;
CREATE POLICY "Admins can view all creative insights" 
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
DROP POLICY IF EXISTS "Admins can view all creative sales" ON public.creative_sales;
CREATE POLICY "Admins can view all creative sales" 
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
DROP POLICY IF EXISTS "Admins can view all subscription events" ON public.subscription_events;
CREATE POLICY "Admins can view all subscription events" 
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
DROP POLICY IF EXISTS "Admins can view all subscription status" ON public.subscription_status;
CREATE POLICY "Admins can view all subscription status" 
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
DROP POLICY IF EXISTS "Admins can view all subscription renewals" ON public.subscription_renewals;
CREATE POLICY "Admins can view all subscription renewals" 
ON public.subscription_renewals 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Habilitar RLS na tabela subscription_renewals se não estiver habilitado
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;