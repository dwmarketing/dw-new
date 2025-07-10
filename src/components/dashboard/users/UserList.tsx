
import React, { useState } from 'react';
import { UserListHeader } from './components/UserListHeader';
import { UsersTable } from './components/UsersTable';
import { UserModals } from './components/UserModals';
import { useUserList } from './hooks/useUserList';
import { useUserModals } from './hooks/useUserModals';

interface UserListProps {
  refreshTrigger?: number;
  currentUserRole?: string;
  onUserUpdated?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  refreshTrigger = 0, 
  currentUserRole = 'user',
  onUserUpdated 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading, refetchUsers } = useUserList(refreshTrigger);
  const {
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
  } = useUserModals();

  const handleUserUpdate = () => {
    refetchUsers();
    if (onUserUpdated) {
      onUserUpdated();
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchTermLower)) ||
      (user.email && user.email.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return <div className="text-white">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <UserListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentUserRole={currentUserRole}
        onCreateClick={openCreateModal}
      />

      <UsersTable
        users={filteredUsers}
        currentUserRole={currentUserRole}
        onView={openDetailModal}
        onEdit={openEditModal}
        onResetPassword={openResetPasswordModal}
        onDelete={openDeleteDialog}
      />

      <UserModals
        selectedUser={selectedUser}
        isCreateModalOpen={isCreateModalOpen}
        isEditModalOpen={isEditModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isDetailModalOpen={isDetailModalOpen}
        isResetPasswordModalOpen={isResetPasswordModalOpen}
        onCloseModals={closeAllModals}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};
