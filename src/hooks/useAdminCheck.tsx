import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminExists = async () => {
    try {
      console.log('Checking admin existence...');
      
      // Check if any user has admin role - this is the most reliable check
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error checking admin roles:', rolesError);
        setAdminExists(false);
        return;
      }

      const hasAdmin = adminRoles && adminRoles.length > 0;
      console.log(`Admin check result: ${hasAdmin ? 'Admin exists' : 'No admin found'}`);
      console.log('Admin roles found:', adminRoles);
      
      setAdminExists(hasAdmin);
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