-- Remove the problematic trigger that's causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the trigger function as well to clean up
DROP FUNCTION IF EXISTS public.handle_new_user();