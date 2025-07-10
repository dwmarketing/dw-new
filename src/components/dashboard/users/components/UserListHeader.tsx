
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentUserRole: string;
  onCreateClick: () => void;
}

export const UserListHeader: React.FC<UserListHeaderProps> = ({
  searchTerm,
  onSearchChange,
  currentUserRole,
  onCreateClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <Input
        type="search"
        placeholder="Buscar usuário..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md bg-neutral-700 text-white placeholder:text-slate-400 border-neutral-600 focus-visible:ring-neutral-500"
      />
      {currentUserRole === 'admin' && (
        <Button
          onClick={onCreateClick}
          className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      )}
    </div>
  );
};
