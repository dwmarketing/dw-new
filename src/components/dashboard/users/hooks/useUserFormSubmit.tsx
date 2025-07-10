
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from '../types';
import { PAGES } from '../constants';

type AppRole = "admin" | "user" | "business_manager";

interface FormData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  role: AppRole;
  permissions: Record<string, boolean>;
}

interface UseUserFormSubmitProps {
  user?: UserWithPermissions;
  onClose: () => void;
  onUserUpdate?: () => void;
  updateChartPermissions: (userId: string) => Promise<void>;
  chartPermissions: Record<string, boolean>;
}

export const useUserFormSubmit = ({
  user,
  onClose,
  onUserUpdate,
  updateChartPermissions,
  chartPermissions
}: UseUserFormSubmitProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) throw roleError;

        // Update page permissions - map frontend keys to database enum values
        for (const page of PAGES) {
          const { error: permError } = await supabase
            .from('user_page_permissions')
            .upsert({
              user_id: user.id,
              page: page.key,
              can_access: formData.permissions[page.frontendKey] || false
            }, {
              onConflict: 'user_id,page'
            });

          if (permError) throw permError;
        }

        // Update chart permissions
        await updateChartPermissions(user.id);

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.access_token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.full_name,
            username: formData.username,
            role: formData.role,
            pagePermissions: formData.permissions,
            chartPermissions: chartPermissions
          },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Falha ao criar usuário');
        }

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Falha ao criar usuário');
        }

        toast({
          title: "Sucesso!",
          description: "Usuário criado com sucesso.",
        });
      }

      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      console.error('User form error:', error);
      toast({
        title: "Erro!",
        description: `Falha ao ${user ? 'atualizar' : 'criar'} usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
};
