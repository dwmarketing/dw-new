import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ChartPermission {
  chart_type: string;
  page: string;
  can_view: boolean;
}

interface ChartPermissionsFormProps {
  permissions: Record<string, boolean>;
  onPermissionsChange: (permissions: Record<string, boolean>) => void;
}

const CHART_PERMISSIONS_BY_PAGE = {
  dashboard: [
    { key: 'kpi_total_investido', label: 'KPI - Total Investido' },
    { key: 'kpi_receita', label: 'KPI - Receita' },
    { key: 'kpi_ticket_medio', label: 'KPI - Ticket Médio' },
    { key: 'kpi_total_pedidos', label: 'KPI - Total de Pedidos' },
  ],
  creatives: [
    { key: 'creative_performance_chart', label: 'Gráfico de Performance dos Criativos' },
    { key: 'creative_sales_chart', label: 'Gráfico de Vendas por Criativo' },
  ],
  sales: [
    { key: 'sales_summary_cards', label: 'Cards de Resumo de Vendas' },
    { key: 'sales_chart', label: 'Gráfico de Vendas' },
    { key: 'country_sales_chart', label: 'Gráfico de Vendas por País' },
    { key: 'state_sales_chart', label: 'Gráfico de Vendas por Estado' },
  ],
  affiliates: [
    { key: 'affiliate_chart', label: 'Gráfico de Afiliados' },
  ],
  subscriptions: [
    { key: 'subscription_renewals_chart', label: 'Gráfico de Renovações' },
    { key: 'subscription_status_chart', label: 'Gráfico de Status das Assinaturas' },
    { key: 'new_subscribers_chart', label: 'Gráfico de Novos Assinantes' },
  ],
};

export const ChartPermissionsForm: React.FC<ChartPermissionsFormProps> = ({
  permissions,
  onPermissionsChange
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (page: string) => {
    setOpenSections(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const handleChartPermissionChange = (chartKey: string, checked: boolean) => {
    onPermissionsChange({
      ...permissions,
      [chartKey]: checked
    });
  };

  const handlePageSelectAll = (page: string, checked: boolean) => {
    const charts = CHART_PERMISSIONS_BY_PAGE[page as keyof typeof CHART_PERMISSIONS_BY_PAGE];
    const updatedPermissions = { ...permissions };
    
    charts.forEach(chart => {
      updatedPermissions[chart.key] = checked;
    });
    
    onPermissionsChange(updatedPermissions);
  };

  const isPageFullySelected = (page: string) => {
    const charts = CHART_PERMISSIONS_BY_PAGE[page as keyof typeof CHART_PERMISSIONS_BY_PAGE];
    return charts.every(chart => permissions[chart.key] === true);
  };

  const isPagePartiallySelected = (page: string) => {
    const charts = CHART_PERMISSIONS_BY_PAGE[page as keyof typeof CHART_PERMISSIONS_BY_PAGE];
    const selectedCount = charts.filter(chart => permissions[chart.key] === true).length;
    return selectedCount > 0 && selectedCount < charts.length;
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Permissões de Gráficos e Cards</Label>
      
      {Object.entries(CHART_PERMISSIONS_BY_PAGE).map(([page, charts]) => (
        <Card key={page} className="border border-slate-200">
          <Collapsible 
            open={openSections[page]}
            onOpenChange={() => toggleSection(page)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isPageFullySelected(page)}
                        onCheckedChange={(checked) => handlePageSelectAll(page, checked === true)}
                        onClick={(e) => e.stopPropagation()}
                        className={isPagePartiallySelected(page) ? "data-[state=checked]:bg-blue-600" : ""}
                      />
                      <CardTitle className="text-sm capitalize">
                        {page.replace('-', ' ')}
                      </CardTitle>
                    </div>
                  </div>
                  {openSections[page] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid gap-3 ml-6">
                  {charts.map((chart) => (
                    <div key={chart.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={chart.key}
                        checked={permissions[chart.key] || false}
                        onCheckedChange={(checked) => {
                          handleChartPermissionChange(chart.key, checked === true);
                        }}
                      />
                      <Label htmlFor={chart.key} className="text-sm font-normal">
                        {chart.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};