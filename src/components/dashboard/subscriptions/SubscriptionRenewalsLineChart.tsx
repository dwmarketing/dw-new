
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/dateUtils";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  totalSalesRevenue: number;
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  totalSalesRevenue
}) => {
  const { lineData: renewalsData, loading: renewalsLoading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: 'all', status: 'all' }
  );

  // Determine the chart period based on date range
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    } else if (daysDiff > 300) {
      return 'yearly';
    } else {
      return 'daily';
    }
  };

  const chartPeriod = getChartPeriod();

  // Get chart title based on period
  const getChartTitle = () => {
    switch (chartPeriod) {
      case 'weekly':
        return 'Renovações da Semana';
      case 'yearly':
        return 'Renovações por Mês';
      default:
        return 'Renovações de Assinaturas';
    }
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'weekly':
        return 'Receita de renovações da semana';
      case 'yearly':
        return 'Receita de renovações por mês';
      default:
        return 'Receita de renovações de assinaturas';
    }
  };

  const formatTooltipValue = (value: any, name: string) => {
    return [formatCurrency(value), 'Renovações'];
  };

  const loading = renewalsLoading;
  const hasData = renewalsData.some(item => item.revenue > 0);

  // Calculate totals for display
  const totalRenewals = renewalsData.reduce((acc, item) => acc + item.revenue, 0);

  console.log('📊 Renewals chart rendering state:', { 
    loading, 
    dataLength: renewalsData.length,
    hasData,
    totalRenewals,
    chartPeriod,
    sampleData: renewalsData.slice(0, 2)
  });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-200">{getChartTitle()}</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            {getChartDescription()}
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(totalRenewals)}
          </div>
          <div className="flex items-center text-xs">
            <span className="text-green-400">
              +12.5%
            </span>
            <span className="text-slate-400 ml-1">
              vs período anterior
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhum dado encontrado</div>
              <div className="text-slate-500 text-sm">
                Não há dados para o período selecionado
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={renewalsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={formatTooltipValue}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="renewals"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
