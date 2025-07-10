
import React from 'react';
import { UserForm } from "../UserForm";
import { DeleteUserDialog } from "../DeleteUserDialog";
import { UserDetailModal } from "../UserDetailModal";
import { ResetPasswordDialog } from "../ResetPasswordDialog";
import { UserWithPermissions } from '../types';

interface UserModalsProps {
  selectedUser?: UserWithPermissions;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  isDetailModalOpen: boolean;
  isResetPasswordModalOpen: boolean;
  onCloseModals: () => void;
  onUserUpdate: () => void;
}

export const UserModals: React.FC<UserModalsProps> = ({
  selectedUser,
  isCreateModalOpen,
  isEditModalOpen,
  isDeleteDialogOpen,
  isDetailModalOpen,
  isResetPasswordModalOpen,
  onCloseModals,
  onUserUpdate
}) => {
  return (
    <>
      <UserForm
        user={selectedUser}
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={onCloseModals}
        onUserUpdate={onUserUpdate}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={onCloseModals}
        onUserUpdate={onUserUpdate}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={onCloseModals}
      />

      <ResetPasswordDialog
        user={selectedUser}
        isOpen={isResetPasswordModalOpen}
        onClose={onCloseModals}
      />
    </>
  );
};
