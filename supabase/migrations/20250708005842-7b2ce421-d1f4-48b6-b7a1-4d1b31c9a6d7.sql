-- Limpar todos os usuários órfãos do sistema de autenticação
-- ATENÇÃO: Isso vai remover TODOS os usuários existentes para resetar o sistema

-- Primeiro, limpar tabelas dependentes na ordem correta
DELETE FROM public.user_page_permissions;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Remover todos os usuários do auth.users (requer privilégios de admin)
-- Isso vai resetar completamente o sistema de autenticação
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Iterar sobre todos os usuários e deletá-los
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Deletar usuário usando a função administrativa
        PERFORM auth.admin_delete_user(user_record.id);
    END LOOP;
END $$;

-- Verificar se as tabelas estão vazias
SELECT 'Profiles count: ' || COUNT(*) FROM public.profiles;
SELECT 'User roles count: ' || COUNT(*) FROM public.user_roles;
SELECT 'Auth users count: ' || COUNT(*) FROM auth.users;