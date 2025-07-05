
-- Update the app_role enum to include business_manager
ALTER TYPE public.app_role ADD VALUE 'business_manager';

-- Update the page enum to include the actual pages used in the application
ALTER TYPE public.page ADD VALUE 'creatives';
ALTER TYPE public.page ADD VALUE 'sales';
ALTER TYPE public.page ADD VALUE 'affiliates';
ALTER TYPE public.page ADD VALUE 'revenue';
ALTER TYPE public.page ADD VALUE 'users';
ALTER TYPE public.page ADD VALUE 'business-managers';
ALTER TYPE public.page ADD VALUE 'subscriptions';
