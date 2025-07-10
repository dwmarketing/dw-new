import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChartPermission {
  chart_type: string;
  page: string;
  can_view: boolean;
}

interface ChartPermissions {
  charts: ChartPermission[];
}

export const useChartPermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<ChartPermissions>({
    charts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartPermissions = async () => {
      if (!user) {
        setPermissions({ charts: [] });
        setLoading(false);
        return;
      }

      try {
        // If user is admin, grant access to all charts
        if (isAdmin) {
          const allCharts = [
            { chart_type: 'kpi_total_investido', page: 'dashboard', can_view: true },
            { chart_type: 'kpi_receita', page: 'dashboard', can_view: true },
            { chart_type: 'kpi_ticket_medio', page: 'dashboard', can_view: true },
            { chart_type: 'kpi_total_pedidos', page: 'dashboard', can_view: true },
            { chart_type: 'creative_performance_chart', page: 'creatives', can_view: true },
            { chart_type: 'creative_sales_chart', page: 'creatives', can_view: true },
            { chart_type: 'sales_summary_cards', page: 'sales', can_view: true },
            { chart_type: 'sales_chart', page: 'sales', can_view: true },
            { chart_type: 'country_sales_chart', page: 'sales', can_view: true },
            { chart_type: 'state_sales_chart', page: 'sales', can_view: true },
            { chart_type: 'affiliate_chart', page: 'affiliates', can_view: true },
            { chart_type: 'subscription_renewals_chart', page: 'subscriptions', can_view: true },
            { chart_type: 'subscription_status_chart', page: 'subscriptions', can_view: true },
            { chart_type: 'new_subscribers_chart', page: 'subscriptions', can_view: true },
          ];
          setPermissions({ charts: allCharts });
          setLoading(false);
          return;
        }

        // Fetch from database for non-admin users
        const { data: chartPermissions, error } = await supabase
          .from('user_chart_permissions')
          .select('chart_type, page, can_view')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching chart permissions:', error);
          setPermissions({ charts: [] });
        } else {
          setPermissions({
            charts: chartPermissions || []
          });
        }
      } catch (error) {
        console.error('Exception fetching chart permissions:', error);
        setPermissions({ charts: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchChartPermissions();
  }, [user?.id, isAdmin]);

  const canViewChart = (chartType: string, page?: string): boolean => {
    // Admins can view everything
    if (isAdmin) {
      return true;
    }
    
    const permission = permissions.charts.find(p => 
      p.chart_type === chartType && (!page || p.page === page)
    );
    
    return permission ? permission.can_view : false;
  };

  return {
    permissions,
    loading,
    canViewChart
  };
};