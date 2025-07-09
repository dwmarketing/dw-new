import { supabase } from '@/integrations/supabase/client';

// Função para testar criação de admin
export const createAdminUser = async () => {
  try {
    const response = await fetch('https://cnhjnfwkjakvxamefzzg.supabase.co/functions/v1/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGpuZndramFrdnhhbWVmenpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTUwODYsImV4cCI6MjA2NDE5MTA4Nn0.x6JzKCrOiVnd_MEoppN5e-EqSnkZQNJSMcjW9pbTjXw`
      },
      body: JSON.stringify({
        email: 'guedesgeovanny@gmail.com',
        password: 'Digital2021',
        fullName: 'Geovanny Guedes'
      })
    });

    const result = await response.json();
    console.log('Admin creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating admin:', error);
    return { error: error.message };
  }
};

// Função para configurar usuário atual como admin
export const setupCurrentUserAsAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    console.log('Setting up current user as admin:', user.id, user.email);

    // 1. Criar/atualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    // 2. Criar role de admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Role error:', roleError);
      throw roleError;
    }

    // 3. Criar permissões de páginas
    const pages = ['dashboard', 'settings', 'analytics', 'billing', 'creatives', 'sales', 'affiliates', 'revenue', 'users', 'business-managers', 'subscriptions'] as const;
    
    const permissionsData = pages.map(page => ({
      user_id: user.id,
      page: page as any,
      can_access: true
    }));

    const { error: permissionsError } = await supabase
      .from('user_page_permissions')
      .upsert(permissionsData);

    if (permissionsError) {
      console.error('Permissions error:', permissionsError);
      throw permissionsError;
    }

    console.log('Successfully set up current user as admin');
    return { success: true, message: 'Current user successfully set up as admin' };

  } catch (error) {
    console.error('Error setting up current user as admin:', error);
    return { error: error.message };
  }
};