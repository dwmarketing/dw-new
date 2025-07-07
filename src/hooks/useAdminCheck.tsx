import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminExists = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setAdminExists((count || 0) > 0);
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