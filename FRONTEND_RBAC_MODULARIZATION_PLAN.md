# 🔐 Frontend RBAC Modularization Plan

## 📋 Current State Analysis

### Issues Identified:
1. **No Authentication Context**: MainLayout and NavigationMenu reference undefined `user` and `usePermissions` hooks
2. **No Permission System**: Navigation items are hardcoded without permission checks
3. **No Admin Pages**: Missing user management and permission assignment interfaces
4. **No Auth Pages**: Missing login/logout functionality
5. **Inconsistent Structure**: Some components reference non-existent hooks and contexts

---

## 🏗️ Proposed Modular Structure

### 1. **Authentication & Authorization Layer**

```
src/
├── contexts/
│   ├── AuthContext.tsx          # User authentication state
│   ├── PermissionContext.tsx    # Permission management
│   └── AdminContext.tsx         # Admin-specific state
├── hooks/
│   ├── useAuth.ts              # Authentication hooks
│   ├── usePermissions.ts       # Permission checking hooks
│   └── useAdmin.ts             # Admin functionality hooks
└── components/
    ├── auth/
    │   ├── LoginForm.tsx       # Login component
    │   ├── ProtectedRoute.tsx  # Route protection wrapper
    │   └── AuthGuard.tsx       # Permission-based access control
    └── admin/
        ├── UserManagement.tsx  # User CRUD interface
        ├── PermissionEditor.tsx # Permission assignment
        └── AdminDashboard.tsx  # Admin overview
```

### 2. **Layout & Navigation Restructure**

```
src/components/layout/
├── MainLayout.tsx              # Updated with auth context
├── NavigationMenu.tsx          # Permission-based navigation
├── Sidebar.tsx                 # Modular sidebar component
├── Header.tsx                  # Modular header component
└── Footer.tsx                  # Modular footer component
```

### 3. **Page Modularization**

```
src/pages/
├── auth/
│   ├── Login.tsx              # Login page
│   ├── Logout.tsx             # Logout page
│   └── ForgotPassword.tsx     # Password reset
├── admin/
│   ├── Dashboard.tsx          # Admin overview
│   ├── Users/
│   │   ├── UserList.tsx       # User management table
│   │   ├── UserCreate.tsx     # Create new user
│   │   ├── UserEdit.tsx       # Edit user permissions
│   │   └── UserProfile.tsx    # User details
│   └── Permissions/
│       ├── PermissionMatrix.tsx # Permission overview
│       └── RoleTemplates.tsx  # Role-based templates
└── [existing pages with permission guards]
```

---

## 🔧 Implementation Steps

### Phase 1: Core Authentication Infrastructure

#### 1.1 Create Authentication Context
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
```

#### 1.2 Create Permission Context
```typescript
// src/contexts/PermissionContext.tsx
interface PermissionContextType {
  permissions: Permission[];
  canRead: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canUpdate: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  isVisible: (module: string) => boolean;
}
```

#### 1.3 Create Authentication Hooks
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  // Authentication logic
};

// src/hooks/usePermissions.ts
export const usePermissions = () => {
  // Permission checking logic
};
```

### Phase 2: Layout & Navigation Updates

#### 2.1 Update MainLayout
- Remove hardcoded user references
- Integrate with AuthContext
- Add loading states

#### 2.2 Update NavigationMenu
- Implement permission-based filtering
- Add module-based visibility checks
- Support dynamic navigation items

#### 2.3 Create Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}
```

### Phase 3: Admin Interface

#### 3.1 User Management Components
```typescript
// src/components/admin/UserManagement.tsx
interface UserManagementProps {
  onUserCreate: (userData: CreateUserData) => void;
  onUserUpdate: (userId: string, userData: UpdateUserData) => void;
  onUserDelete: (userId: string) => void;
}
```

#### 3.2 Permission Editor Component
```typescript
// src/components/admin/PermissionEditor.tsx
interface PermissionEditorProps {
  userId: string;
  permissions: Permission[];
  onPermissionsUpdate: (permissions: Permission[]) => void;
}
```

### Phase 4: Page-Level Permission Integration

#### 4.1 Update Existing Pages
- Wrap all pages with ProtectedRoute
- Add permission checks for CRUD operations
- Implement conditional rendering based on permissions

#### 4.2 Create Module-Specific Guards
```typescript
// src/components/auth/ModuleGuard.tsx
interface ModuleGuardProps {
  module: string;
  action: 'create' | 'read' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

---

## 📁 File Structure Changes

### New Files to Create:
```
src/
├── contexts/
│   ├── AuthContext.tsx
│   ├── PermissionContext.tsx
│   └── AdminContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useAdmin.ts
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AuthGuard.tsx
│   │   └── ModuleGuard.tsx
│   └── admin/
│       ├── UserManagement.tsx
│       ├── PermissionEditor.tsx
│       ├── AdminDashboard.tsx
│       └── RoleTemplates.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Logout.tsx
│   │   └── ForgotPassword.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── Users/
│       │   ├── UserList.tsx
│       │   ├── UserCreate.tsx
│       │   ├── UserEdit.tsx
│       │   └── UserProfile.tsx
│       └── Permissions/
│           ├── PermissionMatrix.tsx
│           └── RoleTemplates.tsx
└── types/
    ├── auth.ts
    ├── permissions.ts
    └── admin.ts
```

### Files to Update:
```
src/
├── App.tsx                    # Add auth routes and context providers
├── components/layout/
│   ├── MainLayout.tsx         # Integrate auth context
│   └── NavigationMenu.tsx     # Add permission filtering
└── [all existing pages]       # Add ProtectedRoute wrapper
```

---

## 🔐 Permission Module Mapping

### Core Modules:
```typescript
const MODULES = {
  dashboard: 'dashboard',
  leads: 'leads',
  customers: 'customers',
  sales: 'sales',
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
  settings: 'settings'
} as const;
```

### Navigation Permission Mapping:
```typescript
const NAVIGATION_PERMISSIONS = {
  '/': 'dashboard',
  '/leads': 'leads',
  '/customers': 'customers',
  '/sales-form': 'sales',
  '/upsell': 'upsell',
  '/projects': 'projects',
  '/kanban': 'kanban',
  '/payments': 'payments',
  '/recurring-services': 'recurring_services',
  '/hr/employees': 'employees',
  '/admin/users': 'user_management'
};
```

---

## 🚀 Implementation Priority

### High Priority (Phase 1):
1. ✅ Create AuthContext and PermissionContext
2. ✅ Create useAuth and usePermissions hooks
3. ✅ Update MainLayout to use auth context
4. ✅ Update NavigationMenu with permission filtering
5. ✅ Create ProtectedRoute component

### Medium Priority (Phase 2):
1. ✅ Create admin user management components
2. ✅ Create permission editor components
3. ✅ Add auth pages (login, logout)
4. ✅ Update App.tsx with auth routes

### Low Priority (Phase 3):
1. ✅ Add role templates
2. ✅ Create admin dashboard
3. ✅ Add advanced permission features
4. ✅ Performance optimizations

---

## 🧪 Testing Strategy

### Unit Tests:
- AuthContext functionality
- Permission checking logic
- Component rendering with permissions

### Integration Tests:
- Login/logout flow
- Navigation filtering
- Admin user management

### E2E Tests:
- Complete user journey with permissions
- Admin user creation and permission assignment

---

## 📝 Next Steps

1. **Start with Phase 1**: Create core authentication infrastructure
2. **Update existing components**: Fix broken references and add auth integration
3. **Create admin interface**: Build user management and permission assignment
4. **Test thoroughly**: Ensure all permission checks work correctly
5. **Document**: Create user guides for admin functionality

This modularization plan will create a robust, scalable RBAC system that follows React best practices and integrates seamlessly with the existing CRM functionality. 