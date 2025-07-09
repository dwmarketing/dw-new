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
    console.log('Received token for password reset (first 20 chars):', token.substring(0, 20))

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Invalid authentication: ${authError.message}`)
    }

    if (!user) {
      console.error('No user found for token')
      throw new Error('Invalid authentication: User not found')
    }

    console.log('Authenticated user:', user.id)

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !userRole) {
      console.error('Role check failed:', roleError)
      throw new Error('Admin access required')
    }

    console.log('Admin verified for password reset:', user.id)

    // Parse request body
    const { userId, newPassword } = await req.json()

    console.log('Resetting password for user:', userId)

    // Validate required fields
    if (!userId || !newPassword) {
      throw new Error('User ID and new password are required')
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    // Reset user password via Supabase Auth Admin API
    const { data, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (resetError) {
      console.error('Error resetting password:', resetError)
      throw new Error(`Password reset failed: ${resetError.message}`)
    }

    if (!data.user) {
      throw new Error('Password reset failed - no user returned')
    }

    console.log('Password reset successfully for user:', data.user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha redefinida com sucesso!'
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
    } else if (errorMessage.includes('Password reset failed') ||
               errorMessage.includes('required') ||
               errorMessage.includes('Password must be')) {
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