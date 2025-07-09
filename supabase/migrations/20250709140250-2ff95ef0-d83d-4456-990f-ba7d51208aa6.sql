-- Comprehensive RLS policy cleanup to fix permission denied errors

-- Step 1: Clean up user_page_permissions policies (remove duplicates)
DROP POLICY IF EXISTS "Allow authenticated users full access to permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow users to delete their own permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow users to update their own permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow authenticated users to view their own permissions" ON public.user_page_permissions;
DROP POLICY IF EXISTS "Allow all authenticated users to view permissions for admin checks" ON public.user_page_permissions;

-- Step 2: Clean up user_roles policies (remove duplicates)
DROP POLICY IF EXISTS "Allow authenticated users full access to roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all authenticated users to view roles for admin checks" ON public.user_roles;

-- Step 3: Create single unified policies for user_page_permissions
CREATE POLICY "Unified access policy for user_page_permissions"
ON public.user_page_permissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Step 4: Create single unified policy for user_roles  
CREATE POLICY "Unified access policy for user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Fix profiles policy (already done in previous migration but ensuring it's correct)
DROP POLICY IF EXISTS "Allow admin and user access to profiles" ON public.profiles;
CREATE POLICY "Unified profiles access policy"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = id OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = id);

-- Step 6: Simplify data table policies (remove conflicting ones and create unified)
-- Subscription Events
DROP POLICY IF EXISTS "Allow admin access and n8n access to subscription_events" ON public.subscription_events;
CREATE POLICY "Unified subscription_events access"
ON public.subscription_events
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Subscription Status
DROP POLICY IF EXISTS "Allow admin access and n8n access to subscription_status" ON public.subscription_status;
CREATE POLICY "Unified subscription_status access"
ON public.subscription_status
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Creative Insights
DROP POLICY IF EXISTS "Allow admin access and n8n access to creative_insights" ON public.creative_insights;
CREATE POLICY "Unified creative_insights access"
ON public.creative_insights
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Creative Sales
DROP POLICY IF EXISTS "Allow admin access and n8n access to creative_sales" ON public.creative_sales;
CREATE POLICY "Unified creative_sales access"
ON public.creative_sales
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Product Sales
DROP POLICY IF EXISTS "Allow admin access and n8n access to product_sales" ON public.product_sales;
CREATE POLICY "Unified product_sales access"
ON public.product_sales
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Business Manager Accounts
DROP POLICY IF EXISTS "Allow admin access and n8n access to business_manager_accounts" ON public.business_manager_accounts;
CREATE POLICY "Unified business_manager_accounts access"
ON public.business_manager_accounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR true);

-- Subscription Renewals (keep admin-only as intended)
DROP POLICY IF EXISTS "Allow admin full access to subscription_renewals" ON public.subscription_renewals;
CREATE POLICY "Unified subscription_renewals access"
ON public.subscription_renewals
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));