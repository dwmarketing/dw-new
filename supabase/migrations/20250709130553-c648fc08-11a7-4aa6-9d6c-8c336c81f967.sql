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

-- 2. Atribuir role de admin
INSERT INTO public.user_roles (user_id, role, assigned_at)
VALUES (
  '69e96f22-7dca-49b9-b049-3e165fdf2edd',
  'admin',
  now()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Dar acesso a todas as páginas
INSERT INTO public.user_page_permissions (user_id, page, can_access)
VALUES 
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'dashboard', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'settings', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'analytics', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'billing', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'creatives', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'sales', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'affiliates', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'revenue', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'users', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'business-managers', true),
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'subscriptions', true)
ON CONFLICT (user_id, page) DO UPDATE SET
  can_access = EXCLUDED.can_access;