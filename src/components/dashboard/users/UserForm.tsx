
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';
import { ChartPermissionsForm } from './ChartPermissionsForm';

type UserPage = "dashboard" | "ai-agents" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";
type AppRole = "admin" | "user" | "business_manager";

interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const PAGES: { key: UserPage; label: string }[] = [
  { key: 'dashboard', label: 'Performance' },
  { key: 'ai-agents', label: 'Agente de IA - Copy' },
  { key: 'creatives', label: 'Criativos' },
  { key: 'sales', label: 'Vendas' }, 
  { key: 'affiliates', label: 'Afiliados' },
  { key: 'subscriptions', label: 'Assinaturas' },
  { key: 'settings', label: 'Configurações' },
  { key: 'business-managers', label: 'Business Managers' },
  { key: 'users', label: 'Usuários' }
];

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as AppRole,
    permissions: {} as Record<UserPage, boolean>
  });
  const [chartPermissions, setChartPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      // Create a complete permissions object with all pages
      const userPermissions = PAGES.reduce((acc, page) => {
        const permission = user.user_page_permissions?.find(p => p.page === page.key);
        acc[page.key] = permission?.can_access || false;
        return acc;
      }, {} as Record<UserPage, boolean>);

      // Load existing chart permissions
      const existingChartPermissions: Record<string, boolean> = {};
      // We'll fetch chart permissions separately since they're not in the UserWithPermissions type yet
      
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        role: user.role,
        permissions: userPermissions
      });
      
      // Fetch chart permissions for the user
      fetchUserChartPermissions(user.id);
    } else {
      // Default permissions for new users - all pages except admin-only ones
      const defaultPermissions = PAGES.reduce((acc, page) => {
        acc[page.key] = !['users', 'business-managers'].includes(page.key);
        return acc;
      }, {} as Record<UserPage, boolean>);

      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        role: 'user',
        permissions: defaultPermissions
      });
      
      // Set default chart permissions for new users
      setChartPermissions({
        // Dashboard KPIs
        kpi_total_investido: true,
        kpi_receita: true,
        kpi_ticket_medio: true,
        kpi_total_pedidos: true,
        // Creatives charts
        creative_performance_chart: true,
        creative_sales_chart: true,
        // Sales charts
        sales_summary_cards: true,
        sales_chart: true,
        country_sales_chart: true,
        state_sales_chart: true,
        // Affiliates charts
        affiliate_chart: true,
        // Subscriptions charts
        subscription_renewals_chart: true,
        subscription_status_chart: true,
        new_subscribers_chart: true,
      });
    }
  }, [user]);

  const fetchUserChartPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, can_view')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching chart permissions:', error);
        return;
      }

      const permissions: Record<string, boolean> = {};
      data?.forEach(perm => {
        permissions[perm.chart_type] = perm.can_view;
      });
      
      setChartPermissions(permissions);
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) throw roleError;

        // Update page permissions
        for (const page of PAGES) {
          const { error: permError } = await supabase
            .from('user_page_permissions')
            .upsert({
              user_id: user.id,
              page: page.key,
              can_access: formData.permissions[page.key]
            }, {
              onConflict: 'user_id,page'
            });

          if (permError) throw permError;
        }

        // Update chart permissions
        await updateChartPermissions(user.id);

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.access_token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.full_name,
            username: formData.username,
            role: formData.role,
            pagePermissions: formData.permissions,
            chartPermissions: chartPermissions
          },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Falha ao criar usuário');
        }

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Falha ao criar usuário');
        }

        toast({
          title: "Sucesso!",
          description: "Usuário criado com sucesso.",
        });
      }

      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: `Falha ao ${user ? 'atualizar' : 'criar'} usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChartPermissions = async (userId: string) => {
    // Delete existing chart permissions
    await supabase
      .from('user_chart_permissions')
      .delete()
      .eq('user_id', userId);

    // Insert new chart permissions
    const chartPermissionEntries = Object.entries(chartPermissions)
      .filter(([_, canView]) => canView)
      .map(([chartType, _]) => {
        // Determine the page for each chart type
        let page = 'dashboard';
        if (chartType.includes('creative')) page = 'creatives';
        else if (chartType.includes('sales') || chartType.includes('country') || chartType.includes('state')) page = 'sales';
        else if (chartType.includes('affiliate')) page = 'affiliates';
        else if (chartType.includes('subscription')) page = 'subscriptions';

        return {
          user_id: userId,
          chart_type: chartType,
          page: page,
          can_view: true
        };
      });

    if (chartPermissionEntries.length > 0) {
      const { error } = await supabase
        .from('user_chart_permissions')
        .insert(chartPermissionEntries);

      if (error) throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user}
              required
            />
          </div>

          {!user && (
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          )}

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: AppRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="business_manager">Gestor de Negócios</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Permissões de Página</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {PAGES.map((page) => (
                <div key={page.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={page.key}
                    checked={formData.permissions[page.key] || false}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [page.key]: checked === true
                        }
                      }));
                    }}
                  />
                  <Label htmlFor={page.key} className="text-sm">
                    {page.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <ChartPermissionsForm 
            permissions={chartPermissions}
            onPermissionsChange={setChartPermissions}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
