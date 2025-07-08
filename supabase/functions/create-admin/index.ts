import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE ADMIN FUNCTION START ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { email, password, fullName }: CreateAdminRequest = await req.json()
    console.log('Creating admin for email:', email);

    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required')
    }

    // Check if admin already exists
    const { data: existingAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
    
    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin user already exists in the system',
          code: 'ADMIN_EXISTS'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        }
      )
    }

    console.log('No existing admin found, creating new user...');

    // Create the user with email confirmation disabled for admin setup
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Auth user creation error:', createError);
      throw new Error(`Failed to create auth user: ${createError.message}`)
    }

    if (!newUser.user) {
      throw new Error('No user returned from auth.createUser')
    }

    const userId = newUser.user.id;
    console.log('Auth user created with ID:', userId);

    // Manually create profile entry (since trigger is removed)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName
      })

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - profile might already exist
    } else {
      console.log('Profile created successfully');
    }

    // Create admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      })

    if (roleError) {
      console.error('Role creation error:', roleError);
      throw new Error(`Failed to create admin role: ${roleError.message}`)
    }

    console.log('Admin role created successfully');

    // Create basic page permissions for admin
    const basicPermissions = [
      { user_id: userId, page: 'dashboard', can_access: true },
      { user_id: userId, page: 'users', can_access: true },
      { user_id: userId, page: 'settings', can_access: true }
    ];

    const { error: permError } = await supabase
      .from('user_page_permissions')
      .insert(basicPermissions)

    if (permError) {
      console.error('Permissions creation error:', permError);
      // Don't fail, just log
    } else {
      console.log('Basic permissions created successfully');
    }

    console.log('=== ADMIN CREATION COMPLETE ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin criado com sucesso! Você já pode fazer login.',
        userId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('=== ERROR IN CREATE-ADMIN ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})