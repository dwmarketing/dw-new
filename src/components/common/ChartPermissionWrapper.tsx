import React from 'react';
import { useChartPermissions } from '@/hooks/useChartPermissions';

interface ChartPermissionWrapperProps {
  children: React.ReactNode;
  chartType: string;
  page?: string;
  fallback?: React.ReactNode;
}

export const ChartPermissionWrapper: React.FC<ChartPermissionWrapperProps> = ({
  children,
  chartType,
  page,
  fallback = null
}) => {
  const { canViewChart, loading } = useChartPermissions();

  if (loading) {
    return null;
  }

  // Check if user can view this specific chart
  if (!canViewChart(chartType, page)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};