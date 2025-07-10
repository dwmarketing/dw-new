
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

type UserPage = "creatives" | "sales" | "affiliates" | "revenue" | "users" | "business-managers" | "subscriptions";
type AppRole = "admin" | "user" | "business_manager";

interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const PAGES: UserPage[] = [
  'creatives',
  'sales', 
  'affiliates',
  'revenue',
  'users',
  'business-managers',
  'subscriptions'
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
        const permission = user.user_page_permissions?.find(p => p.page === page);
        acc[page] = permission?.can_access || false;
        return acc;
      }, {} as Record<UserPage, boolean>);

      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        role: user.role,
        permissions: userPermissions
      });
    } else {
      // Default permissions for new users - ensure all pages are included
      const defaultPermissions = PAGES.reduce((acc, page) => {
        acc[page] = page !== 'users'; // All pages except users
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
    }
  }, [user]);

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

        // Update permissions
        for (const page of PAGES) {
          const pageTyped = page as UserPage;
          const { error: permError } = await supabase
            .from('user_page_permissions')
            .update({ can_access: formData.permissions[pageTyped] })
            .eq('user_id', user.id)
            .eq('page', pageTyped);

          if (permError) throw permError;
        }

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Validate password for new users
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        // Create new user via Edge Function
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
            chartPermissions: [] // Default empty chart permissions
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
              disabled={!!user} // Can't change email for existing users
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
                <div key={page} className="flex items-center space-x-2">
                  <Checkbox
                    id={page}
                    checked={formData.permissions[page] || false}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [page]: checked === true
                        }
                      }));
                    }}
                  />
                  <Label htmlFor={page} className="capitalize text-sm">
                    {page.replace('-', ' ')}
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
