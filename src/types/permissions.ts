export interface Permission {
  id: number;
  user_id: string;
  module_id: number;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  screen_visible: boolean;
  module?: Module;
}

export interface Module {
  id: number;
  name: string;
}

export interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

export interface PermissionContextType extends PermissionState {
  canRead: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canUpdate: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  isVisible: (module: string) => boolean;
  hasAnyPermission: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export interface ModulePermission {
  module: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  screen_visible: boolean;
}

// Core modules mapping
export const MODULES = {
  dashboard: 'dashboard',
  leads: 'leads',
  customers: 'customers',
  sales_form: 'sales_form',
  upsell: 'upsell',
  projects: 'projects',
  kanban: 'kanban',
  payments: 'payments',
  recurring_services: 'recurring_services',
  messages: 'messages',
  automation: 'automation',
  calendar: 'calendar',
  documents: 'documents',
  employees: 'employees',
  user_management: 'user_management',
  role_management: 'role_management',
  upseller_management: 'upseller_management',
  settings: 'settings',
  front_sales_management: 'front_sales_management',
  my_dashboard: 'my_dashboard'
} as const;

export type ModuleName = keyof typeof MODULES;

// Navigation permission mapping
export const NAVIGATION_PERMISSIONS: Record<string, ModuleName> = {
  '/': 'dashboard',
  '/leads': 'leads',
  '/customers': 'customers',
  '/sales-form': 'sales_form',
  '/upsell': 'upsell',
  '/projects': 'projects',
  '/kanban': 'kanban',
  '/payments': 'payments',
  '/recurring-services': 'recurring_services',
  '/hr/employees': 'employees',
  '/admin/users': 'user_management',
  '/admin/roles': 'role_management',
  '/admin/upseller-management': 'upseller_management',
  '/front-sales-management': 'front_sales_management',
  '/front-seller-dashboard': 'my_dashboard'
};

// Role templates for quick permission assignment
export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermission[];
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all modules',
    permissions: Object.values(MODULES).map(module => ({
      module,
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: true,
      screen_visible: true
    }))
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Access to most modules with limited admin functions',
    permissions: [
      { module: 'dashboard', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'leads', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'customers', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'sales_form', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'upsell', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'projects', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'kanban', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'payments', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'recurring_services', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'employees', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'upseller_management', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'user_management', can_create: false, can_read: false, can_update: false, can_delete: false, screen_visible: false }
    ]
  },
  {
    id: 'seller',
    name: 'Sales Representative',
    description: 'Access to sales-related modules',
    permissions: [
      { module: 'dashboard', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'leads', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'customers', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'sales_form', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'upsell', can_create: true, can_read: true, can_update: true, can_delete: false, screen_visible: true },
      { module: 'my_dashboard', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true }
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned modules',
    permissions: [
      { module: 'dashboard', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'leads', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'customers', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
      { module: 'projects', can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true }
    ]
  }
]; 