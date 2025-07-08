-- Limpar dados das tabelas de aplicação para resetar o sistema
-- Isso vai permitir criar o primeiro admin corretamente

-- Limpar tabelas dependentes na ordem correta
DELETE FROM public.user_page_permissions;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Verificar se as tabelas estão vazias
SELECT 'Profiles count after cleanup: ' || COUNT(*) FROM public.profiles;
SELECT 'User roles count after cleanup: ' || COUNT(*) FROM public.user_roles;
SELECT 'Permissions count after cleanup: ' || COUNT(*) FROM public.user_page_permissions;