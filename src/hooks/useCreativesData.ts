
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateRangeForQuery, formatForDisplay } from '@/lib/dateUtils';

interface CreativeMetrics {
  id: string;
  creative_name: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  amount_spent: number;
  views_3s: number;
  views_75_percent: number;
  views_total: number;
  clicks: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  ctr: number;
  conv_body_rate: number;
  sales_count: number;
  gross_sales: number;
  profit: number;
  cpa: number;
  roi: number;
  status: string;
  products: string[];
  tags: string[];
}

interface TotalMetrics {
  spent: number;
  views: number;
  sales: number;
  revenue: number;
}

export const useCreativesData = (
  dateRange: { from: Date; to: Date },
  creativesFilter?: string[],
  statusFilter?: string
) => {
  const [creatives, setCreatives] = useState<CreativeMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCreatives = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting fetchCreatives with dateRange:', dateRange);
      
      // Use standardized date formatting
      const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

      console.log('📅 Date filtering (standardized):', { startDateStr, endDateStr });
      console.log('📅 Original date range:', { from: dateRange.from, to: dateRange.to });
      
      // Fetch campaign data
      let campaignQuery = supabase
        .from('creative_insights')
        .select('*');

      if (dateRange.from && dateRange.to) {
        campaignQuery = campaignQuery
          .gte('date_reported', startDateStr)
          .lte('date_reported', endDateStr);
      }

      console.log('🔍 Executing creative_insights query...');
      const { data: campaignData, error: campaignError } = await campaignQuery;

      if (campaignError) {
        console.error('❌ Error fetching creative_insights:', campaignError);
        throw campaignError;
      }

      console.log('✅ Creative insights data fetched:', { count: campaignData?.length || 0 });

      console.log('🔍 Executing creative_sales query...');
      let salesQuery = supabase
        .from('creative_sales')
        .select('*');

      if (dateRange.from && dateRange.to) {
        salesQuery = salesQuery
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr);
      }

      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('❌ Error fetching creative_sales:', salesError);
        throw salesError;
      }

      console.log('✅ Creative sales data fetched:', { count: salesData?.length || 0 });
      console.log('📊 Total fetched - Campaign data:', campaignData?.length, 'Sales data:', salesData?.length);

      const creativesMap = new Map();

      campaignData?.forEach(campaign => {
        const key = campaign.creative_name;
        if (!creativesMap.has(key)) {
          creativesMap.set(key, {
            creative_name: campaign.creative_name || '',
            campaign_name: campaign.campaign_name || '',
            start_date: '',
            end_date: '',
            amount_spent: 0,
            views_3s: 0,
            views_75_percent: 0,
            views_total: 0,
            clicks: 0,
            pr_hook_rates: [],
            hook_rates: [],
            body_rates: [],
            cta_rates: [],
            ctrs: [],
            status: campaign.status || 'active',
            sales: [],
            products: [],
            tags: []
          });
        }

        const creative = creativesMap.get(key);
        creative.amount_spent += campaign.amount_spent || 0;
        creative.views_3s += campaign.views_3s || 0;
        creative.views_75_percent += campaign.views_75_percent || 0;
        creative.views_total += campaign.views_total || 0;
        creative.clicks += campaign.clicks || 0;
        
        if (campaign.ph_hook_rate) creative.pr_hook_rates.push(campaign.ph_hook_rate);
        if (campaign.hook_rate) creative.hook_rates.push(campaign.hook_rate);
        if (campaign.body_rate) creative.body_rates.push(campaign.body_rate);
        if (campaign.cta_rate) creative.cta_rates.push(campaign.cta_rate);
        if (campaign.ctr) creative.ctrs.push(campaign.ctr);
      });

      salesData?.forEach(sale => {
        const key = sale.creative_name;
        if (creativesMap.has(key)) {
          const creative = creativesMap.get(key);
          creative.sales.push(sale);
          
          // Collect all unique tags from sales
          if (sale.tags && Array.isArray(sale.tags)) {
            sale.tags.forEach((tag: string) => {
              if (!creative.tags.includes(tag)) {
                creative.tags.push(tag);
              }
            });
          }
        }
      });

      const processedCreatives: CreativeMetrics[] = Array.from(creativesMap.values()).map((creative, index) => {
        const salesCount = creative.sales.length;
        const grossSales = creative.sales.reduce((sum: number, sale: any) => sum + (sale.gross_value || 0), 0);
        const profit = grossSales - creative.amount_spent;
        const cpa = salesCount > 0 ? creative.amount_spent / salesCount : 0;
        
        // Apply correct ROI formula: (Revenue - Investment) / Investment
        const roi = creative.amount_spent > 0 ? (grossSales - creative.amount_spent) / creative.amount_spent : 0;
        
        const convBodyRate = creative.views_75_percent > 0 ? (salesCount / creative.views_75_percent) * 100 : 0;

        const avgPrHookRate = creative.pr_hook_rates.length > 0 
          ? creative.pr_hook_rates.reduce((a: number, b: number) => a + b, 0) / creative.pr_hook_rates.length 
          : 0;
        const avgHookRate = creative.hook_rates.length > 0 
          ? creative.hook_rates.reduce((a: number, b: number) => a + b, 0) / creative.hook_rates.length 
          : 0;
        const avgBodyRate = creative.body_rates.length > 0 
          ? creative.body_rates.reduce((a: number, b: number) => a + b, 0) / creative.body_rates.length 
          : 0;
        const avgCtaRate = creative.cta_rates.length > 0 
          ? creative.cta_rates.reduce((a: number, b: number) => a + b, 0) / creative.cta_rates.length 
          : 0;
        const avgCtr = creative.ctrs.length > 0 
          ? creative.ctrs.reduce((a: number, b: number) => a + b, 0) / creative.ctrs.length 
          : 0;

        console.log(`ROI Calculation for ${creative.creative_name}: (${grossSales} - ${creative.amount_spent}) / ${creative.amount_spent} = ${roi}`);

        return {
          id: `creative-${index}`,
          creative_name: creative.creative_name,
          campaign_name: creative.campaign_name,
          start_date: formatForDisplay(dateRange.from, 'date'),
          end_date: formatForDisplay(dateRange.to, 'date'),
          amount_spent: creative.amount_spent,
          views_3s: creative.views_3s,
          views_75_percent: creative.views_75_percent,
          views_total: creative.views_total,
          clicks: creative.clicks,
          pr_hook_rate: avgPrHookRate,
          hook_rate: avgHookRate,
          body_rate: avgBodyRate,
          cta_rate: avgCtaRate,
          ctr: avgCtr,
          conv_body_rate: convBodyRate,
          sales_count: salesCount,
          gross_sales: grossSales,
          profit: profit,
          cpa: cpa,
          roi: roi,
          status: creative.status,
          products: creative.products,
          tags: creative.tags
        };
      });

      // Apply filters
      let filteredCreatives = processedCreatives;
      
      if (creativesFilter && creativesFilter.length > 0) {
        filteredCreatives = filteredCreatives.filter(creative => 
          creativesFilter.includes(creative.creative_name)
        );
      }
      
      if (statusFilter && statusFilter !== 'all') {
        filteredCreatives = filteredCreatives.filter(creative => 
          creative.status === statusFilter
        );
      }

      setCreatives(filteredCreatives);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos criativos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, [dateRange, creativesFilter, statusFilter]);

  // Calculate total metrics
  const totalMetrics: TotalMetrics = {
    spent: creatives.reduce((sum, creative) => sum + creative.amount_spent, 0),
    views: creatives.reduce((sum, creative) => sum + creative.views_total, 0),
    sales: creatives.reduce((sum, creative) => sum + creative.sales_count, 0),
    revenue: creatives.reduce((sum, creative) => sum + creative.gross_sales, 0)
  };

  // Calculate average ROI
  const avgROI = creatives.length > 0 
    ? creatives.reduce((sum, creative) => sum + creative.roi, 0) / creatives.length 
    : 0;

  return { 
    creatives, 
    loading, 
    refetch: fetchCreatives,
    totalMetrics,
    avgROI
  };
};
