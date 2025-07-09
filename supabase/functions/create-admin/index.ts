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
    console.log('=== CREATE ADMIN FUNCTION CALLED ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
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

    console.log('Checking for existing admin users...');
    
    // Check if any admin roles exist first - this is the most reliable check
    const { data: adminRoles, error: adminRolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
    
    if (adminRolesError) {
      console.error('Error checking admin roles:', adminRolesError);
    }
    
    console.log(`Found ${adminRoles?.length || 0} admin roles in database`);
    
    if (adminRoles && adminRoles.length > 0) {
      console.log('Admin already exists, checking for orphaned users...');
      
      // Check if there are orphaned users in auth.users but not in profiles
      const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error checking existing users:', authError)
        throw new Error('Failed to check existing users')
      }

      console.log(`Found ${authUsers.users?.length || 0} users in auth.users`);

      if (authUsers.users && authUsers.users.length > 0) {
        const userIds = authUsers.users.map(u => u.id)
        console.log('Checking profiles for user IDs:', userIds);
        
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('id')
          .in('id', userIds)
        
        if (profilesError) {
          console.error('Error checking profiles:', profilesError);
        }
        
        const profileIds = profiles?.map(p => p.id) || []
        const orphanedUserIds = userIds.filter(id => !profileIds.includes(id))
        
        console.log(`Found ${orphanedUserIds.length} orphaned users:`, orphanedUserIds);
        
        if (orphanedUserIds.length > 0) {
          console.log('Attempting to recover orphaned users...');
          let recoveredCount = 0;
          
          // Try to recover all orphaned users
          for (const userId of orphanedUserIds) {
            const user = authUsers.users.find(u => u.id === userId)
            if (user) {
              try {
                console.log(`Recovering user ${userId}:`, user.email);
                
                // Create profile for orphaned user
                const { error: profileError } = await supabaseClient
                  .from('profiles')
                  .insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User'
                  })

                if (profileError) {
                  console.error('Error creating profile for orphaned user:', userId, profileError)
                  continue
                }
                
                console.log(`Profile created for user ${userId}`);
                
                // Give admin role to orphaned users
                const { error: roleError } = await supabaseClient
                  .from('user_roles')
                  .insert({
                    user_id: user.id,
                    role: 'admin'
                  })

                if (roleError) {
                  console.error('Error creating admin role for orphaned user:', userId, roleError)
                  continue
                }
                
                console.log(`Admin role created for user ${userId}`);

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
                  console.error('Error creating permissions for orphaned user:', userId, permissionsError)
                }
                
                console.log(`Permissions created for user ${userId}`);
                console.log('Successfully recovered orphaned admin user:', user.id)
                recoveredCount++;
                
              } catch (recoverError) {
                console.error('Failed to recover orphaned user:', userId, recoverError)
              }
            }
          }

          console.log(`Recovery complete. ${recoveredCount} users recovered.`);

          // Return recovery results
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: recoveredCount > 0 
                ? `${recoveredCount} usuário(s) órfão(s) recuperado(s) com sucesso! Tente fazer login agora.`
                : 'Tentativa de recuperação concluída, mas nenhum usuário foi recuperado.',
              recovered: true,
              recoveredCount: recoveredCount,
              orphanedCount: orphanedUserIds.length
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }
      
      // If no orphans found but admin exists, block new admin creation
      throw new Error('Admin user already exists. Use recovery option if needed.')
    }

    // At this point, no admin exists, so we can create one

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