import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // First, verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User not found');

      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) throw new Error('Senha atual incorreta');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading
  };
};