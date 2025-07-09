
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateRangeForQuery } from '@/lib/dateUtils';

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
  avgTicket: number;
}

export const useMonthlyKPIs = (dateRange: { from: Date; to: Date }) => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgROI: 0,
    avgTicket: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      
      // Use standardized date formatting
      const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

      console.log('KPI Date filtering (standardized):', { startDateStr, endDateStr });
      console.log('KPI Original date range:', { from: dateRange.from, to: dateRange.to });

      // Fetch campaign data for the selected period
      const { data: campaignData, error: campaignError } = await supabase
        .from('creative_insights')
        .select('amount_spent, clicks')
        .gte('date_reported', startDateStr)
        .lte('date_reported', endDateStr);

      if (campaignError) {
        throw campaignError;
      }

      // Use net_value for revenue calculation and include both completed and Unfulfilled
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('net_value, status')
        .in('status', ['completed', 'Unfulfilled'])
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr);

      if (salesError) {
        throw salesError;
      }

      console.log('KPI Campaign data:', campaignData?.length, 'KPI Sales data:', salesData?.length);

      // Check if we have any data
      const hasAnyData = (campaignData && campaignData.length > 0) || (salesData && salesData.length > 0);
      setIsEmpty(!hasAnyData);

      // Calculate metrics
      const totalSpent = campaignData?.reduce((acc, campaign) => acc + (campaign.amount_spent || 0), 0) || 0;
      
      // Use net_value for revenue calculation
      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.net_value || 0), 0) || 0;
      const totalOrders = salesData?.length || 0;
      
      // Calculate average ticket
      const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculate ROI using the formula: (Total Revenue - Total Invested) / Total Invested
      // Limited to 2 decimal places
      const avgROI = totalSpent > 0 ? Number(((totalRevenue - totalSpent) / totalSpent).toFixed(2)) : 0;

      console.log('🔍 KPI ROI Calculation Debug:', {
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket,
        roiFormula: `(${totalRevenue} - ${totalSpent}) / ${totalSpent} = ${avgROI}`,
        rawROI: totalSpent > 0 ? (totalRevenue - totalSpent) / totalSpent : 0,
        formattedROI: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent).toFixed(2) : '0.00',
        campaignDataLength: campaignData?.length,
        salesDataLength: salesData?.length
      });

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket
      });
    } catch (error) {
      console.error('Error fetching monthly KPIs:', error);
      setError('Erro ao carregar métricas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas mensais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyKPIs();
  }, [dateRange]);

  return { kpis, loading, error, isEmpty, refetch: fetchMonthlyKPIs };
};
