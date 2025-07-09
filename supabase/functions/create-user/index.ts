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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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

    // Verify the requesting user is authenticated and is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    if (roleError || !isAdmin) {
      throw new Error('Admin access required')
    }

    // Parse request body
    const formData = await req.json();

    // Validate required fields
    if (!formData.email || !formData.password || !formData.fullName) {
      throw new Error('Email, password, and full name are required')
    }

    // Create user via Supabase Auth Admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      user_metadata: {
        full_name: formData.fullName
      },
      email_confirm: true
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        throw new Error(`Um usuário com o email ${formData.email} já está registrado. Use um email diferente.`)
      } else {
        throw new Error(`User creation failed: ${createError.message}`)
      }
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user returned')
    }

    // Wait for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update profile with additional information if needed
    if (formData.username) {
      await supabaseAdmin
        .from('profiles')
        .update({
          username: formData.username
        })
        .eq('id', userData.user.id);
    }

    // Update user role if not default
    if (formData.role && formData.role !== 'user') {
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
        throw new Error(`Role setting failed: ${roleUpdateError.message}`)
      }
    }

    // Handle page permissions
    if (formData.pagePermissions && Object.keys(formData.pagePermissions).length > 0) {
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
          throw new Error(`Page permissions update failed: ${pagePermError.message}`)
        }
      }
    }

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
    
    if (errorMessage.includes('Invalid authentication') || 
        errorMessage.includes('Authorization header is required')) {
      status = 401;
    } else if (errorMessage.includes('Admin access required')) {
      status = 403;
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