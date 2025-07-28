# 🚀 **LogicWorks CRM - Comprehensive Implementation Plan**

## 📊 **Current System Analysis**

### **✅ What's Already Implemented:**
- **Leads Management** - Complete with status tracking (new, contacted, qualified, converted, lost)
- **Sales Dispositions** - Comprehensive sales data capture with payment tracking
- **Customer Management** - Customer profiles with payment info (amount, cash_in, remaining)
- **Employee Management** - Full employee database with roles and departments
- **Services Catalog** - 32+ services available (Web Development, SEO, Design, etc.)
- **Basic Project Structure** - Projects table exists but needs enhancement
- **User Authentication** - Supabase auth with role-based profiles
- **Lead Assignment System** - Auto-assignment to front sales agents

### **❌ What Needs Implementation:**
- **Enhanced Sales Form** - Auto-project generation from sales
- **Project Management Workflow** - Assignment and tracking system
- **Departmental Task Boards** - Design, Development, SEO, Marketing
- **Role-Based Access Control** - Project Manager, PM Lead roles
- **Recurring Services** - Retainer management and billing

---

## 🎯 **Phase 1: Enhanced Sales Form & Auto-Project Generation**

### **1.1 Database Schema Enhancements**
```sql
-- Add project assignment fields to projects table
ALTER TABLE projects ADD COLUMN assigned_pm_id UUID REFERENCES employees(id);
ALTER TABLE projects ADD COLUMN assignment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'one-time';
ALTER TABLE projects ADD COLUMN sales_disposition_id UUID REFERENCES sales_dispositions(id);

-- Create project assignment notifications
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  assigned_to_id UUID REFERENCES employees(id),
  assigned_by_id UUID REFERENCES employees(id),
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Add project status enum
CREATE TYPE project_status AS ENUM (
  'unassigned', 'assigned', 'in_progress', 'review', 'completed', 'on_hold'
);

-- Update projects table status
ALTER TABLE projects ALTER COLUMN status TYPE project_status USING status::project_status;
```

### **1.2 Enhanced Sales Form Component**
**File: `src/components/sales/EnhancedSalesForm.tsx`**
- **Service Selection** - Multi-service dropdown with auto-project generation
- **Payment Details** - Cash in, remaining, payment schedule
- **Project Manager Assignment** - Auto-assign based on workload
- **Contract Upload** - File attachment functionality
- **Auto-Project Creation** - One project per service sold

**Features:**
- Multi-service selection with dynamic dropdowns
- Auto-calculate remaining amount
- Project manager assignment dropdown
- File upload for contracts/agreements
- Auto-generate projects for each service
- Real-time validation and error handling

### **1.3 Implementation Steps:**
1. **Create EnhancedSalesForm component**
2. **Add auto-project generation logic**
3. **Implement project assignment workflow**
4. **Add notification system for PM assignments**

---

## 🎯 **Phase 2: Project Management System**

### **2.1 Project Assignment Workflow**
**Database Structure:**
```sql
-- Project assignment workflow
CREATE TABLE project_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  current_status project_status,
  assigned_pm_id UUID REFERENCES employees(id),
  assigned_date TIMESTAMP WITH TIME ZONE,
  estimated_completion DATE,
  actual_completion DATE,
  notes TEXT
);
```

### **2.2 Project Manager Views**
**Files to Create:**
- `src/pages/projects/ProjectAssignment.tsx` - PM Lead sees all unassigned projects
- `src/pages/projects/MyProjects.tsx` - Project Managers see their assigned projects
- `src/pages/projects/ProjectDetail.tsx` - Full project information with sales context
- `src/components/projects/ProjectCard.tsx` - Reusable project card component

**Features:**
- Unassigned projects dashboard for PM Lead
- My projects view for individual PMs
- Project detail view with full context
- Project timeline and milestone tracking
- Status updates and progress tracking

### **2.3 Implementation Steps:**
1. **Create ProjectAssignmentPage** - For PM Lead
2. **Create MyProjectsPage** - For Project Managers
3. **Create ProjectDetailView** - Comprehensive project view
4. **Add project assignment logic**

---

## 🎯 **Phase 3: Departmental Task Boards**

### **3.1 Task Board Structure**
```sql
-- Task board types
CREATE TYPE task_board_type AS ENUM ('design', 'development', 'seo', 'marketing');

-- Task board columns
CREATE TABLE task_board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type task_board_type,
  column_name TEXT,
  column_order INTEGER,
  color TEXT
);

-- Task board tasks
CREATE TABLE task_board_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  board_type task_board_type,
  column_id UUID REFERENCES task_board_columns(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_id UUID REFERENCES employees(id),
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  attachments JSONB,
  comments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default columns for each board
INSERT INTO task_board_columns (board_type, column_name, column_order, color) VALUES
('design', 'To Do', 1, '#e2e8f0'),
('design', 'In Progress', 2, '#fbbf24'),
('design', 'Review', 3, '#8b5cf6'),
('design', 'Completed', 4, '#10b981'),
('development', 'To Do', 1, '#e2e8f0'),
('development', 'In Progress', 2, '#fbbf24'),
('development', 'Testing', 3, '#8b5cf6'),
('development', 'Completed', 4, '#10b981'),
('seo', 'To Do', 1, '#e2e8f0'),
('seo', 'In Progress', 2, '#fbbf24'),
('seo', 'Review', 3, '#8b5cf6'),
('seo', 'Completed', 4, '#10b981'),
('marketing', 'To Do', 1, '#e2e8f0'),
('marketing', 'In Progress', 2, '#fbbf24'),
('marketing', 'Review', 3, '#8b5cf6'),
('marketing', 'Completed', 4, '#10b981');
```

### **3.2 Department Boards**
**Files to Create:**
- `src/pages/tasks/DesignBoard.tsx` - Graphic design, UI/UX tasks
- `src/pages/tasks/DevelopmentBoard.tsx` - Web development, coding tasks
- `src/pages/tasks/SEOBoard.tsx` - SEO optimization tasks
- `src/pages/tasks/MarketingBoard.tsx` - Digital marketing tasks
- `src/components/tasks/TaskBoard.tsx` - Reusable board component
- `src/components/tasks/TaskCard.tsx` - Individual task card

**Features:**
- Drag-and-drop task management
- Real-time status updates
- Task assignment to team members
- Due date tracking
- Priority levels
- File attachments
- Comments system

### **3.3 Implementation Steps:**
1. **Create TaskBoard component** - Reusable for all departments
2. **Create DepartmentBoard pages** - Design, Dev, SEO, Marketing
3. **Add drag-and-drop functionality** - Task status updates
4. **Implement task assignment** - Assign to team members

---

## 🎯 **Phase 4: Role-Based Access Control**

### **4.1 Role Hierarchy**
```sql
-- Enhanced role system
CREATE TYPE enhanced_role AS ENUM (
  'seller', 'pm_lead', 'project_manager', 'designer', 'developer', 'seo_specialist', 'admin'
);

-- Role permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role enhanced_role,
  permission TEXT,
  resource TEXT
);

-- Insert role permissions
INSERT INTO role_permissions (role, permission, resource) VALUES
-- Seller permissions
('seller', 'read', 'leads'),
('seller', 'write', 'leads'),
('seller', 'read', 'sales'),
('seller', 'write', 'sales'),
('seller', 'read', 'customers'),

-- PM Lead permissions
('pm_lead', 'read', 'leads'),
('pm_lead', 'read', 'sales'),
('pm_lead', 'read', 'projects'),
('pm_lead', 'write', 'projects'),
('pm_lead', 'assign', 'projects'),
('pm_lead', 'read', 'tasks'),
('pm_lead', 'read', 'reports'),

-- Project Manager permissions
('project_manager', 'read', 'leads'),
('project_manager', 'read', 'sales'),
('project_manager', 'read', 'projects'),
('project_manager', 'write', 'projects'),
('project_manager', 'read', 'tasks'),
('project_manager', 'write', 'tasks'),
('project_manager', 'read', 'reports'),

-- Designer permissions
('designer', 'read', 'projects'),
('designer', 'read', 'tasks'),
('designer', 'write', 'tasks'),

-- Developer permissions
('developer', 'read', 'projects'),
('developer', 'read', 'tasks'),
('developer', 'write', 'tasks'),

-- SEO Specialist permissions
('seo_specialist', 'read', 'projects'),
('seo_specialist', 'read', 'tasks'),
('seo_specialist', 'write', 'tasks'),

-- Admin permissions
('admin', 'all', 'all');
```

### **4.2 Access Control Matrix**
| Role | Leads | Sales | Projects | Tasks | Reports | Customers |
|------|-------|-------|----------|-------|---------|-----------|
| Seller | ✅ View/Edit | ✅ Create | ❌ | ❌ | ❌ | ✅ View |
| PM Lead | ✅ View | ✅ View | ✅ Assign | ✅ View | ✅ View | ✅ View |
| Project Manager | ✅ View | ✅ View | ✅ Manage | ✅ Manage | ✅ View | ✅ View |
| Designer | ❌ | ❌ | ✅ View | ✅ Manage | ❌ | ❌ |
| Developer | ❌ | ❌ | ✅ View | ✅ Manage | ❌ | ❌ |
| SEO Specialist | ❌ | ❌ | ✅ View | ✅ Manage | ❌ | ❌ |
| Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |

### **4.3 Implementation Steps:**
1. **Create RoleGuard component** - Route protection
2. **Update AuthContext** - Enhanced role checking
3. **Add permission checks** - Throughout components
4. **Create role-based navigation** - Dynamic menu items

---

## 🎯 **Phase 5: Recurring Services**

### **5.1 Recurring Service Structure**
```sql
-- Recurring services
CREATE TABLE recurring_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES sales_dispositions(id),
  service_name TEXT,
  billing_cycle TEXT, -- monthly, quarterly, yearly
  amount NUMERIC,
  status TEXT DEFAULT 'active', -- active, paused, cancelled
  next_billing_date DATE,
  auto_task_generation BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring tasks
CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_service_id UUID REFERENCES recurring_services(id),
  task_template JSONB,
  frequency TEXT, -- monthly, weekly, etc.
  last_generated DATE,
  next_generation_date DATE
);

-- Billing history
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_service_id UUID REFERENCES recurring_services(id),
  billing_date DATE,
  amount NUMERIC,
  status TEXT, -- paid, pending, overdue
  payment_method TEXT,
  invoice_url TEXT
);
```

### **5.2 Implementation Steps:**
1. **Create RecurringServicesPage**
2. **Add billing cycle management**
3. **Implement auto-task generation**
4. **Add renewal notifications**

---

## 🚀 **Implementation Priority & Timeline**

### **Week 1: Foundation (Days 1-7)**
- [ ] **Day 1-2:** Database schema updates
- [ ] **Day 3-4:** Enhanced Sales Form component
- [ ] **Day 5-6:** Auto-project generation logic
- [ ] **Day 7:** Basic project assignment

### **Week 2: Project Management (Days 8-14)**
- [ ] **Day 8-9:** Project assignment workflow
- [ ] **Day 10-11:** Project Manager views
- [ ] **Day 12-13:** Project detail pages
- [ ] **Day 14:** Project status updates

### **Week 3: Task Boards (Days 15-21)**
- [ ] **Day 15-16:** Departmental task boards
- [ ] **Day 17-18:** Drag-and-drop functionality
- [ ] **Day 19-20:** Task assignment system
- [ ] **Day 21:** Task comments and attachments

### **Week 4: Advanced Features (Days 22-28)**
- [ ] **Day 22-23:** Role-based access control
- [ ] **Day 24-25:** Recurring services
- [ ] **Day 26-27:** Reporting and analytics
- [ ] **Day 28:** Testing and bug fixes

---

## 🛠 **Technical Implementation Strategy**

### **1. Component Architecture**
```
src/
├── components/
│   ├── sales/
│   │   ├── EnhancedSalesForm.tsx
│   │   ├── ServiceSelection.tsx
│   │   └── PaymentDetails.tsx
│   ├── projects/
│   │   ├── ProjectAssignment.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── MyProjects.tsx
│   │   └── ProjectCard.tsx
│   ├── tasks/
│   │   ├── TaskBoard.tsx
│   │   ├── DepartmentBoard.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskModal.tsx
│   ├── recurring/
│   │   ├── RecurringServices.tsx
│   │   ├── BillingCycle.tsx
│   │   └── ServiceCard.tsx
│   └── auth/
│       ├── RoleGuard.tsx
│       └── PermissionCheck.tsx
├── pages/
│   ├── sales/
│   │   └── EnhancedSales.tsx
│   ├── projects/
│   │   ├── Assignment.tsx
│   │   ├── MyProjects.tsx
│   │   └── ProjectDetail.tsx
│   ├── tasks/
│   │   ├── DesignBoard.tsx
│   │   ├── DevelopmentBoard.tsx
│   │   ├── SEOBoard.tsx
│   │   └── MarketingBoard.tsx
│   └── recurring/
│       └── Services.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   ├── useRecurringServices.ts
│   └── usePermissions.ts
└── types/
    ├── project.ts
    ├── task.ts
    ├── recurring.ts
    └── permissions.ts
```

### **2. Database Migrations**
- Use Supabase migrations for schema changes
- Implement proper foreign key relationships
- Add RLS policies for security
- Create indexes for performance

### **3. State Management**
- Use React Query for server state
- Implement optimistic updates
- Add real-time notifications
- Cache management for performance

### **4. UI/UX Considerations**
- Consistent design system with Shadcn UI
- Mobile-responsive layouts
- Accessibility compliance
- Loading states and error handling
- Toast notifications for user feedback

---

## 📋 **Current Database Tables Reference**

### **Core Tables:**
- `leads` - Lead management with status tracking
- `sales_dispositions` - Sales data with payment info
- `employees` - Employee database with roles
- `profiles` - User profiles with authentication
- `services` - Service catalog (32+ services)
- `projects` - Project management (needs enhancement)

### **Supporting Tables:**
- `customer_notes` - Customer communication
- `customer_tags` - Customer categorization
- `customer_files` - File attachments
- `customer_tasks` - Customer-specific tasks
- `project_tasks` - Project task management
- `employee_performance_history` - Performance tracking

### **Communication Tables:**
- `conversations` - Chat conversations
- `chat_messages` - Individual messages
- `conversation_participants` - Chat participants

---

## 🎯 **Next Steps**

1. **Start with Enhanced Sales Form** - This is the foundation
2. **Implement auto-project generation** - Core workflow requirement
3. **Build project assignment system** - PM Lead functionality
4. **Create departmental task boards** - Team execution
5. **Add role-based access** - Security and permissions
6. **Implement recurring services** - Advanced features

---

## 📝 **Notes & Considerations**

### **Performance:**
- Implement pagination for large datasets
- Use React Query for caching
- Optimize database queries
- Add proper indexes

### **Security:**
- Row Level Security (RLS) policies
- Role-based access control
- Input validation
- SQL injection prevention

### **Scalability:**
- Modular component architecture
- Reusable hooks and utilities
- TypeScript for type safety
- Proper error boundaries

### **Testing:**
- Unit tests for components
- Integration tests for workflows
- E2E tests for critical paths
- Performance testing

---

**Last Updated:** January 2025
**Status:** Planning Phase
**Next Action:** Begin Phase 1 Implementation 