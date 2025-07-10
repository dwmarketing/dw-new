
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserWithPermissions } from '../types';
import { useToast } from "@/hooks/use-toast";

export const useUserList = (refreshTrigger: number = 0) => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, avatar_url, created_at, updated_at');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Erro ao buscar usuários",
          description: "Ocorreu um erro ao carregar a lista de usuários.",
          variant: "destructive",
        });
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        toast({
          title: "Erro ao buscar funções dos usuários",
          description: "Ocorreu um erro ao carregar as funções dos usuários.",
          variant: "destructive",
        });
        return;
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_page_permissions')
        .select('user_id, page, can_access');

      if (permissionsError) {
        console.error("Error fetching user permissions:", permissionsError);
        toast({
          title: "Erro ao buscar permissões dos usuários",
          description: "Ocorreu um erro ao carregar as permissões dos usuários.",
          variant: "destructive",
        });
        return;
      }

      const usersWithRoles = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id)?.role || 'user';
        const userPermissions = permissions
          .filter(p => p.user_id === profile.id)
          .map(p => ({ 
            page: p.page as "dashboard" | "analytics" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers", 
            can_access: p.can_access 
          }));

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role: userRole as "admin" | "user" | "business_manager",
          permissions: userPermissions,
          user_page_permissions: userPermissions
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados dos usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  return {
    users,
    loading,
    refetchUsers: fetchUsers
  };
};
