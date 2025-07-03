
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface RenewalFilters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
  products: string[];
}

interface DateRange {
  from: Date;
  to: Date;
}

interface RenewalMetrics {
  totalRenewals: number;
  totalRevenue: number;
  averageValue: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
}

export const useSubscriptionRenewalMetrics = (
  dateRange: DateRange,
  filters: RenewalFilters
) => {
  const [metrics, setMetrics] = useState<RenewalMetrics>({
    totalRenewals: 0,
    totalRevenue: 0,
    averageValue: 0,
    activeSubscriptions: 0,
    canceledSubscriptions: 0,
    churnRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching renewal metrics with filters:', filters);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        let query = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply status filter
        if (filters.status !== 'all') {
          if (filters.status === 'active') {
            query = query.eq('subscription_status', 'active');
          } else if (filters.status === 'canceled') {
            query = query.eq('subscription_status', 'canceled');
          } else if (filters.status === 'expired') {
            query = query.eq('subscription_status', 'expired');
          }
        }

        // Apply product filter
        if (filters.products.length > 0) {
          console.log('🔍 Applying product filter to renewal metrics:', filters.products);
          query = query.in('plan', filters.products);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching renewal metrics:', error);
          return;
        }

        if (data) {
          const totalRenewals = data.length;
          const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);
          const averageValue = totalRenewals > 0 ? totalRevenue / totalRenewals : 0;
          
          const activeSubscriptions = data.filter(item => item.subscription_status === 'active').length;
          const canceledSubscriptions = data.filter(item => item.subscription_status === 'canceled').length;
          const churnRate = totalRenewals > 0 ? (canceledSubscriptions / totalRenewals) * 100 : 0;

          setMetrics({
            totalRenewals,
            totalRevenue,
            averageValue,
            activeSubscriptions,
            canceledSubscriptions,
            churnRate
          });

          console.log('✅ Renewal metrics calculated:', {
            totalRenewals,
            totalRevenue,
            averageValue,
            filtersApplied: {
              status: filters.status,
              products: filters.products.length > 0 ? filters.products : 'none'
            }
          });
        }

      } catch (error) {
        console.error('❌ Error fetching renewal metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
