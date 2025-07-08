-- Desabilitar o trigger temporariamente para criar o admin manualmente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Limpeza completa
DELETE FROM public.user_page_permissions WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com');
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com');  
DELETE FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com';
DELETE FROM auth.users WHERE email = 'guedesgeovanny@gmail.com';

-- Criar o admin
DO $$
DECLARE
    user_id UUID := gen_random_uuid();
    encrypted_password TEXT;
BEGIN
    -- Gerar hash da senha
    encrypted_password := crypt('Digital2021', gen_salt('bf'));
    
    -- Inserir usuário na auth.users
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
        role
    ) VALUES (
        user_id,
        '00000000-0000-0000-0000-000000000000',
        'guedesgeovanny@gmail.com',
        encrypted_password,
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Geovanny Guedes"}',
        false,
        'authenticated'
    );
    
    -- Inserir perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'guedesgeovanny@gmail.com',
        'Geovanny Guedes',
        NOW(),
        NOW()
    );
    
    -- Inserir role de admin
    INSERT INTO public.user_roles (
        user_id,
        role,
        assigned_at
    ) VALUES (
        user_id,
        'admin',
        NOW()
    );
    
    -- Inserir permissões
    INSERT INTO public.user_page_permissions (user_id, page, can_access)
    VALUES 
        (user_id, 'dashboard', true),
        (user_id, 'settings', true),
        (user_id, 'analytics', true),
        (user_id, 'billing', true),
        (user_id, 'creatives', true),
        (user_id, 'sales', true),
        (user_id, 'affiliates', true),
        (user_id, 'revenue', true),
        (user_id, 'users', true),
        (user_id, 'business-managers', true),
        (user_id, 'subscriptions', true);
    
    RAISE NOTICE 'Admin criado! ID: % | Email: guedesgeovanny@gmail.com | Senha: Digital2021', user_id;
    
END $$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();