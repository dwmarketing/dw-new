-- Configurar usuário atual como admin
-- User ID: 69e96f22-7dca-49b9-b049-3e165fdf2edd
-- Email: guedesgeovanny@gmail.com

-- 1. Criar perfil do usuário
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '69e96f22-7dca-49b9-b049-3e165fdf2edd',
  'guedesgeovanny@gmail.com',
  'Geovanny Guedes',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 2. Verificar se já existe role de admin, se não existir, criar
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  '69e96f22-7dca-49b9-b049-3e165fdf2edd',
  'admin',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '69e96f22-7dca-49b9-b049-3e165fdf2edd' 
  AND role = 'admin'
);

-- 3. Dar acesso a todas as páginas
INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT 
  '69e96f22-7dca-49b9-b049-3e165fdf2edd',
  unnest(ARRAY['dashboard', 'settings', 'analytics', 'billing', 'creatives', 'sales', 'affiliates', 'revenue', 'users', 'business-managers', 'subscriptions']::page[]),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_page_permissions 
  WHERE user_id = '69e96f22-7dca-49b9-b049-3e165fdf2edd'
);

-- 4. Atualizar permissões existentes para true se já existirem
UPDATE public.user_page_permissions 
SET can_access = true 
WHERE user_id = '69e96f22-7dca-49b9-b049-3e165fdf2edd';