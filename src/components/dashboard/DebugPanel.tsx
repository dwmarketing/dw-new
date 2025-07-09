import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bug, ChevronDown, ChevronRight, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DebugPanelProps {
  dateRange: { from: Date; to: Date };
  kpis: any;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRefresh: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  dateRange,
  kpis,
  loading,
  error,
  isEmpty,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const { toast } = useToast();

  const createTestData = async () => {
    setIsCreatingTestData(true);
    try {
      // Create test creative insights
      const testInsights = [
        {
          creative_name: 'Creative Teste 1',
          amount_spent: 1500.00,
          clicks: 120,
          impressions: 5000,
          ctr: 2.4,
          status: 'active',
          date_reported: new Date().toISOString()
        },
        {
          creative_name: 'Creative Teste 2',
          amount_spent: 2300.50,
          clicks: 180,
          impressions: 7500,
          ctr: 2.4,
          status: 'active',
          date_reported: new Date().toISOString()
        }
      ];

      const { error: insightsError } = await supabase
        .from('creative_insights')
        .insert(testInsights);

      if (insightsError) throw insightsError;

      // Create test sales data
      const testSales = [
        {
          order_id: 'TEST_001',
          creative_name: 'Creative Teste 1',
          net_value: 297.90,
          gross_value: 297.90,
          status: 'completed',
          payment_method: 'credit_card',
          customer_email: 'teste1@example.com',
          sale_date: new Date().toISOString()
        },
        {
          order_id: 'TEST_002',
          creative_name: 'Creative Teste 2',
          net_value: 197.90,
          gross_value: 197.90,
          status: 'completed',
          payment_method: 'pix',
          customer_email: 'teste2@example.com',
          sale_date: new Date().toISOString()
        }
      ];

      const { error: salesError } = await supabase
        .from('creative_sales')
        .insert(testSales);

      if (salesError) throw salesError;

      toast({
        title: "Dados de teste criados!",
        description: "Dados de exemplo foram adicionados ao banco de dados.",
        variant: "default",
      });

      // Refresh data after creating test data
      setTimeout(() => {
        onRefresh();
      }, 1000);

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar os dados de teste.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTestData(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (isEmpty) return <Database className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (loading) return "Carregando...";
    if (error) return "Erro nos dados";
    if (isEmpty) return "Sem dados";
    return "Dados carregados";
  };

  return (
    <Card className="border-amber-200 bg-amber-50/10 backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-50/20 transition-colors">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bug className="h-4 w-4" />
              Debug Dashboard
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div className="flex items-center gap-2 ml-auto">
                {getStatusIcon()}
                <Badge variant={error ? "destructive" : isEmpty ? "secondary" : "default"}>
                  {getStatusText()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Status and Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={onRefresh} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Dados
              </Button>
              
              <Button 
                onClick={createTestData} 
                disabled={isCreatingTestData || loading}
                variant="secondary"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                {isCreatingTestData ? "Criando..." : "Criar Dados de Teste"}
              </Button>
            </div>

            {/* Debug Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold">Período Selecionado:</h4>
                <p>De: {dateRange.from.toLocaleDateString('pt-BR')}</p>
                <p>Até: {dateRange.to.toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Status dos Dados:</h4>
                <p>Loading: {loading ? 'Sim' : 'Não'}</p>
                <p>Erro: {error || 'Nenhum'}</p>
                <p>Dados vazios: {isEmpty ? 'Sim' : 'Não'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">KPIs Atuais:</h4>
                <p>Investido: R$ {kpis.totalSpent.toFixed(2)}</p>
                <p>Receita: R$ {kpis.totalRevenue.toFixed(2)}</p>
                <p>Pedidos: {kpis.totalOrders}</p>
                <p>ROI: {kpis.avgROI}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Diagnóstico:</h4>
                {isEmpty && (
                  <p className="text-yellow-600">
                    ⚠️ Nenhum dado encontrado para o período selecionado.
                  </p>
                )}
                {!isEmpty && kpis.totalSpent === 0 && (
                  <p className="text-yellow-600">
                    ⚠️ Nenhum gasto em campanhas encontrado.
                  </p>
                )}
                {!isEmpty && kpis.totalRevenue === 0 && (
                  <p className="text-yellow-600">
                    ⚠️ Nenhuma venda encontrada.
                  </p>
                )}
                {!isEmpty && kpis.totalSpent > 0 && kpis.totalRevenue > 0 && (
                  <p className="text-green-600">
                    ✅ Dados carregados com sucesso!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};