-- Criar admin diretamente no banco de dados
-- Credenciais: guedesgeovanny@gmail.com / Digital2021

DO $$
DECLARE
    user_id UUID := gen_random_uuid();
    encrypted_password TEXT;
BEGIN
    -- Gerar hash da senha usando a função do Supabase
    encrypted_password := crypt('Digital2021', gen_salt('bf'));
    
    -- Inserir usuário na tabela auth.users
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
    
    -- Inserir perfil na tabela profiles
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
    
    -- Inserir todas as permissões de página
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
    
    -- Mostrar informações do usuário criado
    RAISE NOTICE 'Admin criado com sucesso!';
    RAISE NOTICE 'User ID: %', user_id;
    RAISE NOTICE 'Email: guedesgeovanny@gmail.com';
    RAISE NOTICE 'Senha: Digital2021';
    
END $$;