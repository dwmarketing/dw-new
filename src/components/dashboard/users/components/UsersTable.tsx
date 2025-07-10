
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserWithPermissions } from '../types';
import { UserActions } from './UserActions';

interface UsersTableProps {
  users: UserWithPermissions[];
  currentUserRole: string;
  onView: (user: UserWithPermissions) => void;
  onEdit: (user: UserWithPermissions) => void;
  onResetPassword: (user: UserWithPermissions) => void;
  onDelete: (user: UserWithPermissions) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserRole,
  onView,
  onEdit,
  onResetPassword,
  onDelete
}) => {
  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-800/50">
            <TableHead className="text-slate-300">Nome</TableHead>
            <TableHead className="text-slate-300">Email</TableHead>
            <TableHead className="text-slate-300">Função</TableHead>
            <TableHead className="text-slate-300">Criado em</TableHead>
            <TableHead className="text-slate-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/30">
              <TableCell className="text-white">
                {user.full_name || 'N/A'}
              </TableCell>
              <TableCell className="text-slate-300">
                {user.email || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge className="bg-sky-500 hover:bg-sky-600">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-300">
                {new Date(user.created_at || '').toLocaleDateString()}
              </TableCell>
              <TableCell>
                <UserActions
                  user={user}
                  currentUserRole={currentUserRole}
                  onView={onView}
                  onEdit={onEdit}
                  onResetPassword={onResetPassword}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
