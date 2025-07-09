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
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceRoleKey?.length || 0
    });

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
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

    // Parse request body
    let formData;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      const requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
      
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
    let userData = null;
    
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
          throw new Error(`Um usuário com o email ${formData.email} já está registrado. Use um email diferente.`)
        } else {
          console.error('Error creating user:', createError)
          throw new Error(`User creation failed: ${createError.message}`)
        }
      } else {
        userData = createUserData
        console.log('New user created successfully:', userData.user.id)
      }
    } catch (error) {
      console.error('Error in user creation process:', error)
      throw error
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user returned')
    }

    // Wait for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify profile was created by trigger
    console.log('Verifying profile creation for user:', userData.user.id)
    const { data: profileCheck, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileCheckError) {
      console.error('Profile verification failed:', profileCheckError)
      throw new Error(`Profile verification failed: ${profileCheckError.message}`)
    }

    console.log('Profile verified successfully')

    // Update profile with additional information if needed
    if (formData.fullName && formData.fullName !== profileCheck.full_name) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username || null
        })
        .eq('id', userData.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError)
        throw new Error(`Profile update failed: ${updateError.message}`)
      }
      console.log('Profile updated successfully')
    }

    // Update user role if not default
    if (formData.role && formData.role !== 'user') {
      console.log('Updating user role to:', formData.role)
      
      // Remove default user role
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('role', 'user');

      // Insert new role
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .insert({ 
          user_id: userData.user.id,
          role: formData.role 
        })

      if (roleUpdateError) {
        console.error('Error setting role:', roleUpdateError)
        throw new Error(`Role setting failed: ${roleUpdateError.message}`)
      }
      console.log('Role updated successfully')
    }

    // Handle page permissions
    if (formData.pagePermissions && Object.keys(formData.pagePermissions).length > 0) {
      console.log('Managing page permissions:', formData.pagePermissions)
      
      const pagePermissions = Object.entries(formData.pagePermissions)
        .filter(([_, canAccess]) => canAccess)
        .map(([page, canAccess]) => ({
          user_id: userData.user.id,
          page: page,
          can_access: canAccess
        }))

      if (pagePermissions.length > 0) {
        // Remove default permissions first
        await supabaseAdmin
          .from('user_page_permissions')
          .delete()
          .eq('user_id', userData.user.id)

        // Insert new permissions
        const { error: pagePermError } = await supabaseAdmin
          .from('user_page_permissions')
          .insert(pagePermissions)

        if (pagePermError) {
          console.error('Error setting page permissions:', pagePermError)
          throw new Error(`Page permissions update failed: ${pagePermError.message}`)
        }
        console.log('Page permissions set successfully')
      }
    }

    // Handle chart permissions
    if (formData.chartPermissions && formData.chartPermissions.length > 0) {
      console.log('Managing chart permissions:', formData.chartPermissions)
      
      const chartPermissions = formData.chartPermissions
        .filter((permission: any) => permission.canView)
        .map((permission: any) => ({
          user_id: userData.user.id,
          chart_type: permission.chartType,
          page: permission.page,
          can_view: permission.canView
        }))

      if (chartPermissions.length > 0) {
        const { error: chartPermError } = await supabaseAdmin
          .from('user_chart_permissions')
          .insert(chartPermissions)

        if (chartPermError) {
          console.error('Error setting chart permissions:', chartPermError)
          console.warn('Chart permissions update failed but user was created')
        } else {
          console.log('Chart permissions set successfully')
        }
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