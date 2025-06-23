
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatusData {
  id: string;
  subscription_id: string;
  customer_name: string;
  customer_email: string;
  plan: string;
  amount: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  subscription_number: number;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionStatusData = (
  dateRange: DateRange,
  filters: Filters,
  page: number,
  pageSize: number
) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription status data...');

        // Build query for subscription_status table
        let query = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        // Apply filters
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.eventType !== 'all') {
          if (filters.eventType === 'subscription') {
            query = query.eq('subscription_status', 'Ativo');
          } else if (filters.eventType === 'cancellation') {
            query = query.eq('subscription_status', 'Cancelado');
          }
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('❌ Error fetching subscription status:', error);
          return;
        }

        setSubscriptions(data || []);
        setTotalCount(count || 0);

        console.log('✅ Subscription status data loaded:', {
          count: data?.length || 0,
          totalCount: count || 0,
          page,
          pageSize
        });

      } catch (error) {
        console.error('❌ Error fetching subscription status data:', error);
        setSubscriptions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [dateRange, filters, page, pageSize]);

  return { subscriptions, loading, totalCount };
};
