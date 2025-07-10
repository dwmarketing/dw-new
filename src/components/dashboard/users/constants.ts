
export type UserPage = "dashboard" | "analytics" | "creatives" | "sales" | "affiliates" | "subscriptions" | "settings" | "users" | "business-managers";

export const PAGES: { key: UserPage; label: string; frontendKey: string }[] = [
  { key: 'dashboard', label: 'Performance', frontendKey: 'dashboard' },
  { key: 'analytics', label: 'Agente de IA - Copy', frontendKey: 'ai-agents' },
  { key: 'creatives', label: 'Criativos', frontendKey: 'creatives' },
  { key: 'sales', label: 'Vendas', frontendKey: 'sales' }, 
  { key: 'affiliates', label: 'Afiliados', frontendKey: 'affiliates' },
  { key: 'subscriptions', label: 'Assinaturas', frontendKey: 'subscriptions' },
  { key: 'settings', label: 'Configurações', frontendKey: 'settings' },
  { key: 'business-managers', label: 'Business Managers', frontendKey: 'business-managers' },
  { key: 'users', label: 'Usuários', frontendKey: 'users' }
];
