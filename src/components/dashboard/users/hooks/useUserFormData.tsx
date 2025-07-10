
import { useState, useEffect } from 'react';
import { UserWithPermissions } from '../types';
import { PAGES } from '../constants';

type AppRole = "admin" | "user" | "business_manager";

interface FormData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  role: AppRole;
  permissions: Record<string, boolean>;
}

export const useUserFormData = (user?: UserWithPermissions) => {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as AppRole,
    permissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    if (user) {
      // Create a complete permissions object with all pages using frontend keys
      const userPermissions = PAGES.reduce((acc, page) => {
        const permission = user.user_page_permissions?.find(p => p.page === page.key);
        acc[page.frontendKey] = permission?.can_access || false;
        return acc;
      }, {} as Record<string, boolean>);

      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        role: user.role,
        permissions: userPermissions
      });
    } else {
      // Default permissions for new users - all pages except admin-only ones
      const defaultPermissions = PAGES.reduce((acc, page) => {
        acc[page.frontendKey] = !['users', 'business-managers'].includes(page.frontendKey);
        return acc;
      }, {} as Record<string, boolean>);

      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        role: 'user',
        permissions: defaultPermissions
      });
    }
  }, [user]);

  return { formData, setFormData };
};
