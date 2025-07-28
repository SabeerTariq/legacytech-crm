# 🔐 CRM RBAC Implementation Plan (Supabase + React + Node.js)

This document outlines the complete plan to implement Role-Based Access Control (RBAC) in the CRM using Supabase for the database, Node.js for backend APIs, and React for the frontend.

---

## 🧱 DATABASE SCHEMA (Supabase)

### 1. `employees` (Imported via CSV)
Used as the master record of all employees.

```sql
id SERIAL PRIMARY KEY
name TEXT
email TEXT UNIQUE
phone TEXT
department TEXT
position TEXT
```

---

### 2. `users` (CRM logins)
Admin manually creates these accounts by selecting from `employees`.

```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
employee_id INTEGER REFERENCES employees(id)
email TEXT UNIQUE
password_hash TEXT
created_by_admin_id UUID
status TEXT DEFAULT 'active'  -- 'active', 'disabled'
created_at TIMESTAMP DEFAULT now()
```

---

### 3. `modules` (System modules list)
A static table used to control permissions per module.

```sql
id SERIAL PRIMARY KEY
name TEXT UNIQUE  -- e.g., 'leads', 'projects', 'sales', etc.
```

#### Example Seed:
```sql
INSERT INTO modules (name) VALUES
('leads'), ('sales'), ('projects'), ('design_tasks'), ('dev_tasks'), ('seo_tasks'), ('recurring_services'), ('reports');
```

---

### 4. `permissions` (User-module access)
Stores individual permissions for each user on each module.

```sql
id SERIAL PRIMARY KEY
user_id UUID REFERENCES users(id)
module_id INTEGER REFERENCES modules(id)
can_create BOOLEAN DEFAULT FALSE
can_read BOOLEAN DEFAULT TRUE
can_update BOOLEAN DEFAULT FALSE
can_delete BOOLEAN DEFAULT FALSE
screen_visible BOOLEAN DEFAULT TRUE
```

---

## 🧑‍💼 USER CREATION FLOW (Admin Panel)

### Page: `/admin/users/create`

#### Step 1: Select Employee
- Search and select from existing `employees` table.

#### Step 2: Set Login Credentials
- Pre-fill email from employee
- Manually enter password

#### Step 3: Assign Permissions
- Table layout with checkboxes:
```
[Leads]    [✓ Create] [✓ Read] [✓ Update] [ ] Delete [✓ Visible]
[Projects] [✓ Create] [✓ Read] [✓ Update] [ ] Delete [✓ Visible]
```

#### API (Node.js):
```ts
POST /api/admin/create-user
Body: {
  employee_id, email, password, permissions: [
    { module_id, can_create, can_read, can_update, can_delete, screen_visible }
  ]
}
```

---

## 🔑 LOGIN FLOW

- User logs in with email + password
- On login:
  - Fetch user’s permissions from `permissions` table
  - Store them in global context (React) or session/JWT

---

## ⚙️ BACKEND MIDDLEWARE

### Route-level permission check:
```js
const checkPermission = (moduleName, action) => async (req, res, next) => {
  const { userId } = req.user;
  const result = await db.permissions.findOne({
    where: { user_id: userId, module_name: moduleName }
  });
  if (!result?.[`can_${action}`]) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
```

Usage:
```js
app.post('/leads', checkPermission('leads', 'create'), createLead);
```

---

## ⚛️ FRONTEND (React) – UI-Based Access Control

### On login:
- Fetch and store permission object in context:
```js
permissions = {
  leads: { create: true, read: true, update: false, delete: false, visible: true },
  projects: { ... }
};
```

### Conditional rendering:
```jsx
{permissions?.leads?.visible && <SidebarLink to="/leads">Leads</SidebarLink>}

{permissions?.leads?.create && (
  <button onClick={handleCreateLead}>Add Lead</button>
)}
```

---

## 🗂 ADMIN USER MANAGEMENT

### Page: `/admin/users`
- Table of users
  - Name, Role, Email, Status
  - Action: Edit Permissions, Reset Password

### Page: `/admin/users/:id/edit`
- Update user password
- Update permissions (CRUD + visibility)

### Backend:
- GET `/api/users`
- PUT `/api/users/:id/permissions`
- PATCH `/api/users/:id/reset-password`

---

## 🧪 TESTING CHECKLIST

- ✅ Create user manually by selecting employee
- ✅ Permissions stored correctly
- ✅ Screen visibility works based on permission
- ✅ API rejects unauthorized actions
- ✅ Admin can edit permissions and disable users

---

## 💡 OPTIONAL FEATURES

| Feature           | Description                                           |
|------------------|-------------------------------------------------------|
| Role Templates    | Save preset permissions (e.g. Seller, PM, Dev)        |
| Login Logs        | Track user logins and last seen                      |
| Multi-Brand Tagging | Limit user view by assigned brand(s)               |
| Password Reset    | Admin or self-reset via token                        |
| Activity Logs     | Log permission and user changes                      |

---

## ✅ FINAL CHECKLIST

- [ ] Supabase tables created
- [ ] Static modules seeded
- [ ] Admin UI built for user + permission creation
- [ ] Node.js API endpoints ready for user mgmt + auth
- [ ] React context for permission-based UI control
- [ ] CRUD and visibility enforced in backend routes
- [ ] Users can log in and use only what’s allowed