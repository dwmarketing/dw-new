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

    // Check if any admin users exist in the auth system
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error checking existing users:', authError)
      throw new Error('Failed to check existing users')
    }

    // If there are existing users, check if any have admin role
    if (authUsers.users && authUsers.users.length > 0) {
      const { data: adminRoles } = await supabaseClient
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
      
      if (adminRoles && adminRoles.length > 0) {
        throw new Error('Admin user already exists. Cannot create additional admins via this endpoint.')
      }

      // Check for orphaned users (users in auth but not in profiles)
      const userIds = authUsers.users.map(u => u.id)
      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('id')
        .in('id', userIds)
      
      const profileIds = profiles?.map(p => p.id) || []
      const orphanedUserIds = userIds.filter(id => !profileIds.includes(id))
      
      if (orphanedUserIds.length > 0) {
        console.log('Found orphaned users, attempting to recover:', orphanedUserIds)
        
        // Try to recover all orphaned users
        for (const userId of orphanedUserIds) {
          const user = authUsers.users.find(u => u.id === userId)
          if (user) {
            try {
              // Create profile for orphaned user
              const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email
                })

              if (profileError) {
                console.error('Error creating profile for orphaned user:', profileError)
                continue
              }
              
              // Give admin role to all orphaned users (they were likely meant to be admins)
              const { error: roleError } = await supabaseClient
                .from('user_roles')
                .insert({
                  user_id: user.id,
                  role: 'admin'
                })

              if (roleError) {
                console.error('Error creating admin role for orphaned user:', roleError)
                continue
              }

              // Grant all page permissions to the admin
              const pagePermissions = [
                'dashboard', 'settings', 'analytics', 'billing', 'creatives', 
                'sales', 'affiliates', 'revenue', 'users', 'business-managers', 'subscriptions'
              ].map(page => ({
                user_id: user.id,
                page,
                can_access: true
              }))
              
              const { error: permissionsError } = await supabaseClient
                .from('user_page_permissions')
                .insert(pagePermissions)

              if (permissionsError) {
                console.error('Error creating permissions for orphaned user:', permissionsError)
              }

              console.log('Successfully recovered orphaned admin user:', user.id)
            } catch (recoverError) {
              console.error('Failed to recover orphaned user:', recoverError)
            }
          }
        }

        // After recovery attempt, return success message
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Usuários órfãos recuperados com sucesso! Faça login com suas credenciais existentes.',
            recovered: true,
            recoveredCount: orphanedUserIds.length
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
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
      
      // Handle specific error cases
      if (userError.message?.includes('email address has already been registered')) {
        return new Response(
          JSON.stringify({ 
            error: 'Este email já está registrado. Use a opção de recuperação ou entre em contato com o suporte.',
            code: 'EMAIL_ALREADY_EXISTS'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
          }
        )
      }
      
      if (userError.message?.includes('password')) {
        return new Response(
          JSON.stringify({ 
            error: 'Senha inválida. A senha deve ter pelo menos 6 caracteres.',
            code: 'INVALID_PASSWORD'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422, // Unprocessable Entity
          }
        )
      }
      
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