
export interface UserWithPermissions {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: "admin" | "user" | "business_manager";
  permissions: {
    page: "dashboard" | "analytics" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";
    can_access: boolean;
  }[];
  user_page_permissions: {
    page: "dashboard" | "analytics" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";
    can_access: boolean;
  }[];
}

export interface ChartPermissionsProps {
  // This interface is kept for backward compatibility but chart permissions
  // are now handled through the ChartPermissionsForm component
}
