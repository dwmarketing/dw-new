
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, KeyRound } from "lucide-react";
import { UserWithPermissions } from '../types';

interface UserActionsProps {
  user: UserWithPermissions;
  currentUserRole: string;
  onView: (user: UserWithPermissions) => void;
  onEdit: (user: UserWithPermissions) => void;
  onResetPassword: (user: UserWithPermissions) => void;
  onDelete: (user: UserWithPermissions) => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUserRole,
  onView,
  onEdit,
  onResetPassword,
  onDelete
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(user)}
        className="text-slate-300 border-slate-600"
      >
        <Eye className="w-4 h-4" />
      </Button>
      {currentUserRole === 'admin' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="text-slate-300 border-slate-600"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResetPassword(user)}
            className="text-orange-400 border-orange-600 hover:bg-orange-600/20"
            title="Redefinir Senha"
          >
            <KeyRound className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user)}
            className="text-red-400 border-red-600 hover:bg-red-600/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};
