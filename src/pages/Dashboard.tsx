
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TrendingUp, DollarSign, Users, Eye, MousePointer, Target, BarChart3, Settings, Calendar, ShoppingCart } from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { SubscriptionsTab } from "@/components/dashboard/SubscriptionsTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { BusinessManagersTab } from "@/components/dashboard/BusinessManagersTab";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";
import { useLocation } from "react-router-dom";
import { startOfDay, endOfDay } from "date-fns";

const Dashboard = () => {
  const {
    isAdmin
  } = useAuth();
  const {
    canAccessPage
  } = usePermissions();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/users') return "users";
    if (location.pathname === '/business-managers') return "business-managers";
    return "creatives";
  });

  // Função para obter o período "hoje" por padrão
  const getTodayRange = () => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });
  const [dateRange, setDateRange] = useState(getTodayRange);
  const {
    kpis,
    loading: kipsLoading
  } = useMonthlyKPIs(dateRange);
  React.useEffect(() => {
    if (activeTab === "users") {
      window.history.pushState({}, '', '/users');
    } else if (activeTab === "business-managers") {
      window.history.pushState({}, '', '/business-managers');
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [activeTab]);

  // Função para obter o título da página atual
  const getPageTitle = () => {
    if (location.pathname === '/users') return "Usuários";
    if (location.pathname === '/business-managers') return "Business Managers";
    return "Performance";
  };

  // Função para obter a descrição da página atual
  const getPageDescription = () => {
    if (location.pathname === '/users') return "Gerenciamento de usuários";
    if (location.pathname === '/business-managers') return "Gerenciamento de Business Managers";
    return "Dashboard completo de métricas e análises";
  };

  // Verificar acesso às páginas especiais
  if (location.pathname === '/users') {
    if (!isAdmin && !canAccessPage('users')) {
      return <SidebarInset>
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-slate-300 text-sm md:text-base">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>;
    }
    return <SidebarInset>
        <div className="min-h-screen bg-slate-900">
          <div className="container mx-auto p-3 md:p-6">
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-white" />
                <div className="flex-1">
                  <h1 className="text-lg md:text-2xl font-bold text-white">{getPageTitle()}</h1>
                  <p className="text-slate-300 text-xs md:text-sm">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-slate-800 border-transparent backdrop-blur-sm">
              <CardContent className="p-3 md:p-6 bg-slate-900">
                <UsersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>;
  }
  if (location.pathname === '/business-managers') {
    if (!isAdmin && !canAccessPage('business-managers')) {
      return <SidebarInset>
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Acesso Negado</h1>
              <p className="text-slate-300 text-sm md:text-base">Você não tem permissão para acessar esta página.</p>
            </div>
          </div>
        </SidebarInset>;
    }
    return <SidebarInset>
        <div className="min-h-screen bg-slate-900">
          <div className="container mx-auto p-3 md:p-6">
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-white" />
                <div className="flex-1">
                  <h1 className="text-lg md:text-2xl font-bold text-white">{getPageTitle()}</h1>
                  <p className="text-slate-300 text-xs md:text-sm">{getPageDescription()}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
            <Card className="bg-slate-800 border-transparent backdrop-blur-sm">
              <CardContent className="p-3 md:p-6 bg-slate-900">
                <BusinessManagersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>;
  }
  return <SidebarInset>
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto p-3 md:p-6 bg-transparent">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-white" />
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-white">{getPageTitle()}</h1>
                <p className="text-slate-300 text-xs md:text-sm">{getPageDescription()}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <div className="order-1">
                <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
              </div>
              <div className="order-2">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Updated top cards layout - now with 4 cards including Ticket Médio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <KPICard title="Total Investido" value={kipsLoading ? "Carregando..." : `R$ ${kpis.totalSpent.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} change={kipsLoading ? "..." : "+12.5%"} icon={DollarSign} trend="up" variant="black" />
            <KPICard title="Receita" value={kipsLoading ? "Carregando..." : `R$ ${kpis.totalRevenue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} change={kipsLoading ? "..." : "+23.8%"} icon={TrendingUp} trend="up" variant="success" />
            <KPICard title="Ticket Médio" value={kipsLoading ? "Carregando..." : `R$ ${kpis.avgTicket.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} change={kipsLoading ? "..." : "+8.3%"} icon={Target} trend="up" variant="info" />
            <KPICard title="Total de Pedidos" value={kipsLoading ? "Carregando..." : kpis.totalOrders.toLocaleString()} change={kipsLoading ? "..." : "+15.6%"} icon={ShoppingCart} trend="up" variant="purple" />
          </div>

          <Card className="border-transparent backdrop-blur-sm bg-transparent ">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3 md:pb-4">
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-center bg-slate-800/50 rounded-2xl p-2 min-w-[500px] sm:min-w-0 mx-auto max-w-fit">
                    <PermissionWrapper requirePage="creatives" fallback={null}>
                      <button onClick={() => setActiveTab("creatives")} className={`px-8 py-3 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap flex-1 text-center ${activeTab === "creatives" ? "bg-slate-600 text-white font-semibold shadow-lg transform scale-105" : "bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                        Criativos
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="sales" fallback={null}>
                      <button onClick={() => setActiveTab("sales")} className={`px-8 py-3 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap flex-1 text-center ${activeTab === "sales" ? "bg-slate-600 text-white font-semibold shadow-lg transform scale-105" : "bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                        Vendas
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="affiliates" fallback={null}>
                      <button onClick={() => setActiveTab("affiliates")} className={`px-8 py-3 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap flex-1 text-center ${activeTab === "affiliates" ? "bg-slate-600 text-white font-semibold shadow-lg transform scale-105" : "bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                        Afiliados
                      </button>
                    </PermissionWrapper>
                    <PermissionWrapper requirePage="subscriptions" fallback={null}>
                      <button onClick={() => setActiveTab("subscriptions")} className={`px-8 py-3 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap flex-1 text-center ${activeTab === "subscriptions" ? "bg-slate-600 text-white font-semibold shadow-lg transform scale-105" : "bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                        Assinaturas
                      </button>
                    </PermissionWrapper>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 md:p-6 bg-slate-900">
                <PermissionWrapper requirePage="creatives">
                  <div className={activeTab === "creatives" ? "block" : "hidden"}>
                    <CreativesTab dateRange={dateRange} globalKPIs={kpis} globalKPIsLoading={kipsLoading} />
                  </div>
                </PermissionWrapper>
                
                <PermissionWrapper requirePage="sales">
                  <div className={activeTab === "sales" ? "block" : "hidden"}>
                    <SalesTab dateRange={dateRange} />
                  </div>
                </PermissionWrapper>
                
                <PermissionWrapper requirePage="affiliates">
                  <div className={activeTab === "affiliates" ? "block" : "hidden"}>
                    <AffiliatesTab dateRange={dateRange} />
                  </div>
                </PermissionWrapper>

                <PermissionWrapper requirePage="subscriptions">
                  <div className={activeTab === "subscriptions" ? "block" : "hidden"}>
                    <SubscriptionsTab dateRange={dateRange} />
                  </div>
                </PermissionWrapper>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </SidebarInset>;
};

export default Dashboard;
