
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify the requesting user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Received token (first 20 chars):', token.substring(0, 20))

    // Verify the token and get user using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Invalid authentication: ${authError.message}`)
    }

    if (!user) {
      console.error('No user found for token')
      throw new Error('Invalid authentication: User not found')
    }

    console.log('Authenticated user:', user.id)

    // Check if user is admin using RPC function to avoid RLS issues
    const { data: isAdmin, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    if (roleError || !isAdmin) {
      console.error('Role check failed:', roleError)
      throw new Error('Admin access required')
    }

    console.log('Admin verified:', user.id)

    // Parse request body - Fixed parsing logic
    let formData;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      const requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
      
      // Use requestBody directly - no nested formData
      formData = requestBody;
      
      if (!formData) {
        throw new Error('No data found in request');
      }
      
      console.log('Form data extracted:', formData);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    console.log('Creating user with data:', {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role
    })

    // Validate required fields
    if (!formData.email || !formData.password || !formData.fullName) {
      throw new Error('Email, password, and full name are required')
    }

    // Create user via Supabase Auth Admin API
    let userData;
    let isNewUser = false;
    
    try {
      const { data: createUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.fullName
        },
        email_confirm: true
      })

      if (createError) {
        // Check if user already exists
        if (createError.message.includes('already been registered')) {
          console.log('User already exists, fetching existing user:', formData.email)
          // Get existing user by email
          const { data: existingUsers, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
          
          if (getUserError) {
            throw new Error(`Failed to fetch existing user: ${getUserError.message}`)
          }
          
          const existingUser = existingUsers.users.find(u => u.email === formData.email)
          if (!existingUser) {
            throw new Error('User exists but could not be found')
          }
          
          userData = { user: existingUser }
          console.log('Found existing user:', existingUser.id)
        } else {
          console.error('Error creating user:', createError)
          throw new Error(`User creation failed: ${createError.message}`)
        }
      } else {
        userData = createUserData
        isNewUser = true
        console.log('New user created successfully:', userData.user.id)
      }
    } catch (error) {
      console.error('Error in user creation process:', error)
      throw error
    }

    if (!userData.user) {
      throw new Error('User creation/fetch failed - no user returned')
    }

    // Update profile with additional information
    console.log('Attempting to update profile for user:', userData.user.id)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        username: formData.username || null
      })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw new Error(`Profile update failed: ${profileError.message}`)
    } else {
      console.log('Profile updated successfully')
    }

    // Set user role
    console.log('Attempting to set user role:', formData.role, 'for user:', userData.user.id)
    const { error: roleUpdateError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ 
        user_id: userData.user.id,
        role: formData.role 
      })

    if (roleUpdateError) {
      console.error('Error setting role:', roleUpdateError)
      throw new Error(`Role setting failed: ${roleUpdateError.message}`)
    } else {
      console.log('Role set successfully')
    }

    // Set page permissions
    console.log('Setting page permissions:', formData.pagePermissions)
    const pagePermissions = Object.entries(formData.pagePermissions || {})
      .filter(([_, canAccess]) => canAccess)
      .map(([page, canAccess]) => ({
        user_id: userData.user.id,
        page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue' | 'users',
        can_access: canAccess
      }))

    if (pagePermissions.length > 0) {
      // Delete existing permissions first
      console.log('Deleting existing page permissions for user:', userData.user.id)
      await supabaseAdmin
        .from('user_page_permissions')
        .delete()
        .eq('user_id', userData.user.id)

      console.log('Inserting new page permissions:', pagePermissions)
      const { error: pagePermError } = await supabaseAdmin
        .from('user_page_permissions')
        .insert(pagePermissions)

      if (pagePermError) {
        console.error('Error setting page permissions:', pagePermError)
        throw new Error(`Page permissions update failed: ${pagePermError.message}`)
      } else {
        console.log('Page permissions set successfully')
      }
    }

    // Set chart permissions
    const chartPermissions = (formData.chartPermissions || [])
      .filter((permission: any) => permission.canView)
      .map((permission: any) => ({
        user_id: userData.user.id,
        chart_type: permission.chartType as 'performance_overview' | 'time_series' | 'top_creatives' | 'metrics_comparison' | 'conversion_funnel' | 'roi_analysis' | 'sales_summary' | 'affiliate_performance' | 'revenue_breakdown' | 'creatives_sales',
        page: permission.page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
        can_view: permission.canView
      }))

    if (chartPermissions.length > 0) {
      // Delete existing chart permissions first
      await supabaseAdmin
        .from('user_chart_permissions')
        .delete()
        .eq('user_id', userData.user.id)

      const { error: chartPermError } = await supabaseAdmin
        .from('user_chart_permissions')
        .insert(chartPermissions)

      if (chartPermError) {
        console.error('Error setting chart permissions:', chartPermError)
        console.warn('Chart permissions update failed but user was created')
      }
    }

    console.log('User setup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'Usuário criado com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    
    let status = 400;
    let errorMessage = error.message || 'Erro interno do servidor';
    
    // Set appropriate status codes
    if (errorMessage.includes('Invalid authentication') || 
        errorMessage.includes('Authorization header is required') ||
        errorMessage.includes('User not found')) {
      status = 401;
    } else if (errorMessage.includes('Admin access required')) {
      status = 403;
    } else if (errorMessage.includes('User creation failed') ||
               errorMessage.includes('required')) {
      status = 400;
    } else {
      status = 500;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status,
      },
    )
  }
})
