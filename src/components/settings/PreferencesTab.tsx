import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Palette, Bell, Save, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

export const PreferencesTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dashboardAutoRefresh: true,
    dateFormat: 'dd/MM/yyyy',
    currency: 'BRL'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento das preferências
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferências salvas!",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferências Gerais
          </CardTitle>
          <CardDescription className="text-slate-300">
            Personalize sua experiência no dashboard
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription className="text-slate-300">
            Configure o tema e aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Tema</Label>
              <p className="text-sm text-slate-400">
                Escolha entre tema claro ou escuro
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[130px] bg-slate-600 border-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription className="text-slate-300">
            Configure como você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Notificações por Email</Label>
              <p className="text-sm text-slate-400">
                Receba atualizações importantes por email
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Notificações Push</Label>
              <p className="text-sm text-slate-400">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Dashboard</CardTitle>
          <CardDescription className="text-slate-300">
            Configurações específicas do dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Atualização Automática</Label>
              <p className="text-sm text-slate-400">
                Atualizar dados automaticamente a cada 5 minutos
              </p>
            </div>
            <Switch
              checked={preferences.dashboardAutoRefresh}
              onCheckedChange={(checked) => handlePreferenceChange('dashboardAutoRefresh', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Formato de Data</Label>
              <p className="text-sm text-slate-400">
                Como as datas serão exibidas
              </p>
            </div>
            <Select 
              value={preferences.dateFormat} 
              onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
            >
              <SelectTrigger className="w-[130px] bg-slate-600 border-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Moeda</Label>
              <p className="text-sm text-slate-400">
                Moeda para exibição de valores
              </p>
            </div>
            <Select 
              value={preferences.currency} 
              onValueChange={(value) => handlePreferenceChange('currency', value)}
            >
              <SelectTrigger className="w-[100px] bg-slate-600 border-slate-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ BRL</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSavePreferences}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salvar Preferências
      </Button>
    </div>
  );
};