
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
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!serviceRoleKey 
      });
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
      console.error('Missing or invalid authorization header');
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid authentication')
    }

    console.log('Authenticated user:', user.id);

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    console.log('Admin check result:', { isAdmin, roleError });

    if (roleError || !isAdmin) {
      console.error('Admin access denied:', { isAdmin, roleError });
      throw new Error('Admin access required')
    }

    // Parse request body
    const formData = await req.json();
    console.log('Form data received:', { 
      email: formData.email, 
      fullName: formData.fullName,
      role: formData.role,
      hasPassword: !!formData.password
    });

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
      console.error('User creation failed:', createError);
      if (createError.message.includes('already been registered')) {
        throw new Error(`Um usuário com o email ${formData.email} já está registrado. Use um email diferente.`)
      } else {
        throw new Error(`User creation failed: ${createError.message}`)
      }
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user returned')
    }

    console.log('User created successfully:', userData.user.id);

    // Wait for trigger to complete profile creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update profile with additional information if needed
    if (formData.username) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          username: formData.username
        })
        .eq('id', userData.user.id);

      if (profileError) {
        console.error('Profile update failed:', profileError);
      }
    }

    // Update user role if not default
    if (formData.role && formData.role !== 'user') {
      console.log('Updating user role to:', formData.role);
      
      // Remove default user role first
      const { error: deleteRoleError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('role', 'user');

      if (deleteRoleError) {
        console.error('Failed to remove default user role:', deleteRoleError);
      }

      // Insert new role
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .insert({ 
          user_id: userData.user.id,
          role: formData.role 
        })

      if (roleUpdateError) {
        console.error('Role update failed:', roleUpdateError);
        throw new Error(`Role setting failed: ${roleUpdateError.message}`)
      }
    }

    // Handle page permissions - convert to proper enum values
    if (formData.pagePermissions && Object.keys(formData.pagePermissions).length > 0) {
      console.log('Processing page permissions:', formData.pagePermissions);
      
      // Map frontend page names to database enum values
      const pageMapping: { [key: string]: string } = {
        'dashboard': 'dashboard',
        'ai-agents': 'analytics', // Map ai-agents to analytics enum value
        'creatives': 'creatives',
        'sales': 'sales',
        'affiliates': 'affiliates',
        'subscriptions': 'subscriptions',
        'settings': 'settings',
        'users': 'users',
        'business-managers': 'business-managers'
      };

      const pagePermissions = Object.entries(formData.pagePermissions)
        .filter(([_, canAccess]) => canAccess)
        .map(([page, canAccess]) => {
          const mappedPage = pageMapping[page];
          if (!mappedPage) {
            console.warn(`Unknown page permission: ${page}`);
            return null;
          }
          return {
            user_id: userData.user.id,
            page: mappedPage,
            can_access: canAccess
          };
        })
        .filter(Boolean);

      if (pagePermissions.length > 0) {
        // Remove existing permissions (except defaults set by trigger)
        const { error: deletePermError } = await supabaseAdmin
          .from('user_page_permissions')
          .delete()
          .eq('user_id', userData.user.id)
          .not('page', 'in', '(dashboard,settings)'); // Keep defaults

        if (deletePermError) {
          console.error('Failed to clear existing permissions:', deletePermError);
        }

        // Insert new permissions
        const { error: pagePermError } = await supabaseAdmin
          .from('user_page_permissions')
          .upsert(pagePermissions, {
            onConflict: 'user_id,page'
          });

        if (pagePermError) {
          console.error('Page permissions update failed:', pagePermError);
          throw new Error(`Page permissions update failed: ${pagePermError.message}`)
        }
      }
    }

    // Handle chart permissions
    if (formData.chartPermissions && Object.keys(formData.chartPermissions).length > 0) {
      console.log('Processing chart permissions:', Object.keys(formData.chartPermissions).length, 'charts');
      
      const chartPermissionEntries = Object.entries(formData.chartPermissions)
        .filter(([_, canView]) => canView)
        .map(([chartType, _]) => {
          // Determine the page for each chart type
          let page = 'dashboard';
          if (chartType.includes('creative')) page = 'creatives';
          else if (chartType.includes('sales') || chartType.includes('country') || chartType.includes('state')) page = 'sales';
          else if (chartType.includes('affiliate')) page = 'affiliates';
          else if (chartType.includes('subscription')) page = 'subscriptions';

          return {
            user_id: userData.user.id,
            chart_type: chartType,
            page: page,
            can_view: true
          };
        });

      if (chartPermissionEntries.length > 0) {
        const { error: chartPermError } = await supabaseAdmin
          .from('user_chart_permissions')
          .insert(chartPermissionEntries);

        if (chartPermError) {
          console.error('Chart permissions insert failed:', chartPermError);
          throw new Error(`Chart permissions update failed: ${chartPermError.message}`)
        }
      }
    }

    console.log('User creation completed successfully');

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
