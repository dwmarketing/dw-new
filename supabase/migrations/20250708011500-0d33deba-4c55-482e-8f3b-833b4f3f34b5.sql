-- Limpar usuário existente completamente
DELETE FROM public.user_page_permissions WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com');
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com');  
DELETE FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com';
DELETE FROM auth.users WHERE email = 'guedesgeovanny@gmail.com';

-- Inserir usuário com hash compatível
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'guedesgeovanny@gmail.com',
    '$2a$10$K8Z0LmJ4F1IUZ1Q9r9l4ku2e.G9J.ZQf5XN9Q8J7XKZ8r9YqKq.gm', -- hash da senha 'Digital2021'
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Geovanny Guedes"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
);

-- Pegar o ID do usuário criado
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'guedesgeovanny@gmail.com';
    
    -- Inserir perfil
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (user_uuid, 'guedesgeovanny@gmail.com', 'Geovanny Guedes', NOW(), NOW());
    
    -- Inserir role de admin
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (user_uuid, 'admin', NOW());
    
    -- Inserir permissões
    INSERT INTO public.user_page_permissions (user_id, page, can_access)
    VALUES 
        (user_uuid, 'dashboard', true),
        (user_uuid, 'settings', true),
        (user_uuid, 'analytics', true),
        (user_uuid, 'billing', true),
        (user_uuid, 'creatives', true),
        (user_uuid, 'sales', true),
        (user_uuid, 'affiliates', true),
        (user_uuid, 'revenue', true),
        (user_uuid, 'users', true),
        (user_uuid, 'business-managers', true),
        (user_uuid, 'subscriptions', true);
        
    RAISE NOTICE 'Admin recriado! Email: guedesgeovanny@gmail.com | Senha: Digital2021';
END $$;