import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminExists = async () => {
    try {
      // First check if any users exist in auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error checking auth users:', authError);
        setAdminExists(false);
        return;
      }

      // If no users exist at all, no admin exists
      if (!authUsers?.users || authUsers.users.length === 0) {
        setAdminExists(false);
        return;
      }

      // Check if any user has admin role
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error checking admin roles:', rolesError);
        setAdminExists(false);
        return;
      }

      setAdminExists(adminRoles && adminRoles.length > 0);
    } catch (error) {
      console.error('Error checking admin existence:', error);
      setAdminExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminExists();
  }, []);

  const refetchAdminStatus = () => {
    setLoading(true);
    checkAdminExists();
  };

  return {
    adminExists,
    loading,
    refetchAdminStatus
  };
};