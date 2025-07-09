import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';

interface ResetPasswordDialogProps {
  user: UserWithPermissions | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ 
  user, 
  isOpen, 
  onClose 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;

    setLoading(true);

    try {
      // Validate password
      if (newPassword.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      // Get current session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      // Call reset password edge function
      const response = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: user.id,
          newPassword: newPassword
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Falha ao redefinir senha');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Falha ao redefinir senha');
      }

      toast({
        title: "Sucesso!",
        description: "Senha redefinida com sucesso.",
      });

      setNewPassword('');
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: `Falha ao redefinir senha: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription>
            Defina uma nova senha para {user?.full_name || user?.email}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !newPassword}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};