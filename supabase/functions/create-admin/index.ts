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
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { email, password, fullName }: CreateAdminRequest = await req.json()

    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required')
    }

    // Check if any users exist (to prevent unauthorized admin creation)
    const { count } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      throw new Error('Admin user already exists. Cannot create additional admins via this endpoint.')
    }

    // Create user account
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: true // Auto-confirm for admin
    })

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    if (!userData.user) {
      throw new Error('Failed to create user')
    }

    console.log('Admin user created successfully:', userData.user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        userId: userData.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-admin function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})