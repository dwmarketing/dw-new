-- Limpeza completa e forçada do usuário
DELETE FROM public.user_page_permissions WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com'
    UNION 
    SELECT id FROM auth.users WHERE email = 'guedesgeovanny@gmail.com'
);

DELETE FROM public.user_roles WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com'
    UNION 
    SELECT id FROM auth.users WHERE email = 'guedesgeovanny@gmail.com'
);

DELETE FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com';

-- Remover da tabela auth.users também
DELETE FROM auth.users WHERE email = 'guedesgeovanny@gmail.com';

-- Verificar se limpeza foi completa
DO $$
DECLARE
    auth_count INTEGER;
    profile_count INTEGER;
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'guedesgeovanny@gmail.com';
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email = 'guedesgeovanny@gmail.com';
    SELECT COUNT(*) INTO role_count FROM public.user_roles ur 
    JOIN public.profiles p ON ur.user_id = p.id 
    WHERE p.email = 'guedesgeovanny@gmail.com';
    
    RAISE NOTICE 'Limpeza concluída! Auth: %, Profiles: %, Roles: %', auth_count, profile_count, role_count;
END $$;