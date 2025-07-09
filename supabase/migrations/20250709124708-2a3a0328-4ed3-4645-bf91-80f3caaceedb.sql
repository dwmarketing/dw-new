-- Fix RLS recursion by creating a security definer function and updating policies

-- Create security definer function to check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing problematic policies on user_roles that cause recursion
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create new policies using the security definer function
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing problematic policies on user_page_permissions that cause recursion
DROP POLICY IF EXISTS "Admins can manage all user permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_page_permissions;

-- Create new policies using the security definer function
CREATE POLICY "Admins can manage all user permissions" 
ON public.user_page_permissions 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own permissions" 
ON public.user_page_permissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Update all other admin policies to use the security definer function
DROP POLICY IF EXISTS "Admins can view all creative insights" ON public.creative_insights;
CREATE POLICY "Admins can view all creative insights" 
ON public.creative_insights 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all creative sales" ON public.creative_sales;
CREATE POLICY "Admins can view all creative sales" 
ON public.creative_sales 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all subscription events" ON public.subscription_events;
CREATE POLICY "Admins can view all subscription events" 
ON public.subscription_events 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all subscription status" ON public.subscription_status;
CREATE POLICY "Admins can view all subscription status" 
ON public.subscription_status 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all subscription renewals" ON public.subscription_renewals;
CREATE POLICY "Admins can view all subscription renewals" 
ON public.subscription_renewals 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all product sales" ON public.product_sales;
CREATE POLICY "Admins can view all product sales" 
ON public.product_sales 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all business manager accounts" ON public.business_manager_accounts;
CREATE POLICY "Admins can view all business manager accounts" 
ON public.business_manager_accounts 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Ensure all admin users have complete page permissions
DO $$
DECLARE
    admin_user_id uuid;
    page_name text;
    pages text[] := ARRAY['dashboard', 'creatives', 'sales', 'affiliates', 'revenue', 'users', 'business-managers', 'subscriptions', 'settings', 'analytics', 'billing'];
BEGIN
    -- For each admin user
    FOR admin_user_id IN 
        SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'
    LOOP
        -- For each page
        FOREACH page_name IN ARRAY pages
        LOOP
            -- Insert permission if it doesn't exist, update if it does
            INSERT INTO public.user_page_permissions (user_id, page, can_access)
            VALUES (admin_user_id, page_name::public.page, true)
            ON CONFLICT (user_id, page) 
            DO UPDATE SET can_access = true;
        END LOOP;
    END LOOP;
END $$;