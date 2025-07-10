
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ChartType = Database['public']['Enums']['chart_type'];

export const useChartPermissions = (userId?: string) => {
  const [chartPermissions, setChartPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userId) {
      fetchUserChartPermissions(userId);
    } else {
      // Set default chart permissions for new users
      setChartPermissions({
        // Dashboard KPIs
        kpi_total_investido: true,
        kpi_receita: true,
        kpi_ticket_medio: true,
        kpi_total_pedidos: true,
        // Creatives charts
        creative_performance_chart: true,
        creative_sales_chart: true,
        // Sales charts
        sales_summary_cards: true,
        sales_chart: true,
        country_sales_chart: true,
        state_sales_chart: true,
        // Affiliates charts
        affiliate_chart: true,
        // Subscriptions charts
        subscription_renewals_chart: true,
        subscription_status_chart: true,
        new_subscribers_chart: true,
      });
    }
  }, [userId]);

  const fetchUserChartPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, can_view')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching chart permissions:', error);
        return;
      }

      const permissions: Record<string, boolean> = {};
      data?.forEach(perm => {
        permissions[perm.chart_type] = perm.can_view;
      });
      
      setChartPermissions(permissions);
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
    }
  };

  const updateChartPermissions = async (userId: string) => {
    // Delete existing chart permissions
    await supabase
      .from('user_chart_permissions')
      .delete()
      .eq('user_id', userId);

    // Insert new chart permissions with proper typing
    const chartPermissionEntries = Object.entries(chartPermissions)
      .filter(([_, canView]) => canView)
      .map(([chartType, _]) => {
        // Determine the page for each chart type
        let page = 'dashboard';
        if (chartType.includes('creative')) page = 'creatives';
        else if (chartType.includes('sales') || chartType.includes('country') || chartType.includes('state')) page = 'sales';
        else if (chartType.includes('affiliate')) page = 'affiliates';
        else if (chartType.includes('subscription')) page = 'subscriptions';

        return {
          user_id: userId,
          chart_type: chartType as ChartType,
          page: page,
          can_view: true
        };
      });

    if (chartPermissionEntries.length > 0) {
      const { error } = await supabase
        .from('user_chart_permissions')
        .insert(chartPermissionEntries);

      if (error) throw error;
    }
  };

  return { chartPermissions, setChartPermissions, updateChartPermissions };
};
