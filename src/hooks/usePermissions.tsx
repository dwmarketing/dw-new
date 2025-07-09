
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PagePermission {
  page: string;
  can_access: boolean;
}

interface Permissions {
  pages: PagePermission[];
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({
    pages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      console.log('🔍 usePermissions effect triggered:', { 
        hasUser: !!user, 
        userId: user?.id, 
        isAdmin,
        loadingAuth: loading 
      });

      if (!user) {
        console.log('🔒 No user found, skipping permissions fetch');
        setPermissions({ pages: [] });
        setLoading(false);
        return;
      }

      try {
        // If user is admin, skip database fetch (they have access to everything)
        if (isAdmin) {
          console.log('👑 User is admin, granting all permissions without DB fetch');
          setPermissions({
            pages: [
              { page: 'dashboard', can_access: true },
              { page: 'creatives', can_access: true },
              { page: 'sales', can_access: true },
              { page: 'affiliates', can_access: true },
              { page: 'subscriptions', can_access: true },
              { page: 'users', can_access: true },
              { page: 'business-managers', can_access: true },
            ]
          });
          setLoading(false);
          return;
        }

        // Only fetch from database for non-admin users
        console.log('🔍 Non-admin user, fetching page permissions from database...');
        const { data: pagePermissions, error } = await supabase
          .from('user_page_permissions')
          .select('page, can_access')
          .eq('user_id', user.id);

        console.log('🔍 Database permissions response:', { 
          pagePermissions, 
          error,
          count: pagePermissions?.length || 0 
        });

        if (error) {
          console.error('❌ Error fetching permissions:', error);
          // Set empty permissions on error
          setPermissions({ pages: [] });
        } else {
          setPermissions({
            pages: pagePermissions || []
          });
        }
      } catch (error) {
        console.error('❌ Exception fetching permissions:', error);
        setPermissions({ pages: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, isAdmin]); // Simplified dependencies

  const canAccessPage = (page: string): boolean => {
    console.log(`🔍 Checking access for page "${page}":`, { isAdmin, permissions });
    
    // Admins têm acesso total
    if (isAdmin) {
      console.log(`✅ Admin access granted for page "${page}"`);
      return true;
    }
    
    const permission = permissions.pages.find(p => p.page === page);
    const hasAccess = permission ? permission.can_access : false;
    console.log(`🔍 Page "${page}" access result:`, { permission, hasAccess });
    
    return hasAccess;
  };

  return {
    permissions,
    loading,
    canAccessPage
  };
};
