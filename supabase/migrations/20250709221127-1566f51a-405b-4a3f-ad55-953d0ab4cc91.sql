-- Atribuir role de admin ao usuário
INSERT INTO user_roles (user_id, role)
VALUES ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'admin');

-- Atribuir permissões de acesso a todas as páginas
INSERT INTO user_page_permissions (user_id, page, can_access)
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
  ('69e96f22-7dca-49b9-b049-3e165fdf2edd', 'subscriptions', true);