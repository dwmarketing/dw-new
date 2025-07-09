import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';

export interface DeleteUserDialogProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { toast } = useToast();

  const handleDeleteUser = async () => {
    if (!user?.id) {
      toast({
        title: "Erro!",
        description: "Usuário inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current session for authorization
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      // Call delete user edge function
      const response = await supabase.functions.invoke('delete-user', {
        body: {
          userId: user.id
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Falha ao excluir usuário');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Falha ao excluir usuário');
      }

      toast({
        title: "Sucesso!",
        description: "Usuário excluído com sucesso.",
      });
      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: `Erro inesperado: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá excluir permanentemente o usuário {user?.full_name} da plataforma.
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteUser}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
