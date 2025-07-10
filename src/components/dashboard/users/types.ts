
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
    page: "dashboard" | "ai-agents" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";
    can_access: boolean;
  }[];
  user_page_permissions: {
    page: "dashboard" | "ai-agents" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";
    can_access: boolean;
  }[];
}

export interface ChartPermissionsProps {
  // Componente removido - não será mais usado
}
