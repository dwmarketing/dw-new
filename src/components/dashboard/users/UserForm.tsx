
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserWithPermissions } from './types';
import { ChartPermissionsForm } from './ChartPermissionsForm';
import { UserFormFields } from './components/UserFormFields';
import { PagePermissions } from './components/PagePermissions';
import { useUserFormData } from './hooks/useUserFormData';
import { useChartPermissions } from './hooks/useChartPermissions';
import { useUserFormSubmit } from './hooks/useUserFormSubmit';

interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { formData, setFormData } = useUserFormData(user);
  const { chartPermissions, setChartPermissions, updateChartPermissions } = useChartPermissions(user?.id);
  const { handleSubmit, loading } = useUserFormSubmit({
    user,
    onClose,
    onUserUpdate,
    updateChartPermissions,
    chartPermissions
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <UserFormFields
            formData={formData}
            setFormData={setFormData}
            isEditMode={!!user}
          />

          <PagePermissions
            formData={formData}
            setFormData={setFormData}
          />

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
