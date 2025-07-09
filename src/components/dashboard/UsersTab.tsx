
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserList } from "./users/UserList";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const UsersTab: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const { user } = useAuth();
  
  const handleUserUpdated = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setCurrentUserRole(data.role);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return (
    <PermissionWrapper requirePage="users">
      <div className="space-y-4 md:space-y-6">
        <div className="px-1">
          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Gerenciamento de Usuários</h2>
          <p className="text-gray-400 text-sm md:text-base">
            Gerencie usuários e suas permissões de acesso
          </p>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-3 md:p-6">
            <UserList 
              refreshTrigger={refreshTrigger}
              currentUserRole={currentUserRole}
              onUserUpdated={handleUserUpdated}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
