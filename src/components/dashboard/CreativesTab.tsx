
import React, { useState } from 'react';
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { ImprovedMetricsOverviewCharts } from "./creatives/ImprovedMetricsOverviewCharts";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesMetricsCards } from "./creatives/CreativesMetricsCards";
import { useCreativesData } from "@/hooks/useCreativesData";
import { RefreshButton } from "./RefreshButton";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
  globalKPIs: {
    totalSpent: number;
    totalRevenue: number;
    totalOrders: number;
    avgROI: number;
  };
  globalKPIsLoading: boolean;
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ 
  dateRange, 
  globalKPIs, 
  globalKPIsLoading 
}) => {
  const [creativesFilter, setCreativesFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    creatives, 
    loading, 
    totalMetrics, 
    avgROI,
    refetch 
  } = useCreativesData(dateRange, creativesFilter, statusFilter);

  // Mock CSV export function
  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  return (
    <div className="space-y-6 bg-slate-900">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Métricas de Criativos</h3>
        <RefreshButton onRefresh={refetch} loading={loading} />
      </div>
      
      <CreativesMetricsCards 
        totalSpent={totalMetrics.spent}
        avgROI={globalKPIs.avgROI}
        loading={globalKPIsLoading}
      />
      
      <ImprovedMetricsOverviewCharts 
        creatives={creatives} 
        dateRange={dateRange}
      />
      
      <TimeSeriesChart 
        creatives={creatives}
        dateRange={dateRange}
      />
      
      <CreativesTable 
        creatives={creatives}
        loading={loading}
        filteredCreatives={creatives}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
