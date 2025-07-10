
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PAGES } from '../constants';

interface FormData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "user" | "business_manager";
  permissions: Record<string, boolean>;
}

interface PagePermissionsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const PagePermissions: React.FC<PagePermissionsProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div>
      <Label>Permissões de Página</Label>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {PAGES.map((page) => (
          <div key={page.frontendKey} className="flex items-center space-x-2">
            <Checkbox
              id={page.frontendKey}
              checked={formData.permissions[page.frontendKey] || false}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  permissions: {
                    ...prev.permissions,
                    [page.frontendKey]: checked === true
                  }
                }));
              }}
            />
            <Label htmlFor={page.frontendKey} className="text-sm">
              {page.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
