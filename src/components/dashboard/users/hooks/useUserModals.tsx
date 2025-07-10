
import { useState } from 'react';
import { UserWithPermissions } from '../types';

export const useUserModals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | undefined>(undefined);

  const openCreateModal = () => {
    setSelectedUser(undefined);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openDetailModal = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const openResetPasswordModal = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteDialogOpen(false);
    setIsDetailModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setSelectedUser(undefined);
  };

  return {
    selectedUser,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    isDetailModalOpen,
    isResetPasswordModalOpen,
    openCreateModal,
    openEditModal,
    openDeleteDialog,
    openDetailModal,
    openResetPasswordModal,
    closeAllModals
  };
};
