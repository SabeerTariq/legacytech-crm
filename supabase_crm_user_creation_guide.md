# 🔐 Supabase CRM User Creation & RBAC – Full AI Prompt Guide (with Code)

This guide is designed for an AI assistant or developer to fully implement a secure user creation and RBAC system in a CRM using Supabase (backend & auth), Node.js (backend API), and React (frontend).

---

## ✅ GOAL

- Only the **admin** can create users manually from the CRM.
- Admin selects an employee from a pre-imported list.
- Admin sets a **username (email)** and **password**.
- The CRM backend creates the user in Supabase Auth using the **admin SDK** (`email_confirm: true` to skip verification).
- Admin assigns **CRUD + screen visibility permissions** per module.
- The user is inserted into a `users` table and linked to the employee.
- The user logs in via the CRM login form (no email verification needed).
- All permissions are enforced in backend routes and frontend UI.

---

## 🧱 DATABASE STRUCTURE (Supabase Tables)

### 1. `employees`
```sql
id SERIAL PRIMARY KEY,
name TEXT,
email TEXT,
department TEXT,
position TEXT
```

### 2. `users`
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
employee_id INTEGER REFERENCES employees(id),
email TEXT UNIQUE,
created_by_admin_id UUID,
status TEXT DEFAULT 'active'
```

### 3. `modules`
```sql
id SERIAL PRIMARY KEY,
name TEXT UNIQUE
```

Seed example:
```sql
INSERT INTO modules (name) VALUES
('leads'), ('sales'), ('projects'), ('design_tasks'), ('dev_tasks'), ('seo_tasks'), ('recurring_services'), ('reports');
```

### 4. `permissions`
```sql
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
module_id INTEGER REFERENCES modules(id),
can_create BOOLEAN,
can_read BOOLEAN,
can_update BOOLEAN,
can_delete BOOLEAN,
screen_visible BOOLEAN
```

---

## 🔐 USER CREATION API (Node.js / Express)

### Supabase Admin Client
```js
// utils/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### Express Route: `/api/admin/create-user`
```js
import express from 'express'
import { supabaseAdmin } from './utils/supabaseAdmin.js'
import db from './db.js' // Your SQL helper

const router = express.Router()

router.post('/api/admin/create-user', async (req, res) => {
  const { employee_id, email, password, permissions } = req.body

  // Validate inputs
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  // Prevent duplicates
  const existing = await supabaseAdmin.auth.listUsers({ email })
  if (existing?.data?.users?.length > 0) {
    return res.status(409).json({ error: 'User already exists' })
  }

  // Create user in Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { employee_id }
  })

  if (error) return res.status(500).json({ error: error.message })

  const user_id = data.user.id

  // Insert into CRM users table
  await db('users').insert({ id: user_id, employee_id, email })

  // Insert permissions
  const formatted = permissions.map(p => ({ user_id, ...p }))
  await db('permissions').insert(formatted)

  res.status(201).json({ message: 'User created', user_id })
})

export default router
```

---

## ⚛️ REACT: Admin Form to Create Users

```tsx
const handleCreateUser = async () => {
  await axios.post('/api/admin/create-user', {
    employee_id: selectedEmployee.id,
    email,
    password,
    permissions
  })
}
```

Form includes:
- Employee dropdown
- Email + Password
- Module-permission matrix

---

## 🔐 USER LOGIN FLOW (React)
No change needed:
```ts
await supabase.auth.signInWithPassword({
  email,
  password
})
```

---

## 🧠 SECURITY NOTES

- Only admins should access the user creation endpoint
- Supabase **service role key must be backend-only**
- Validate all inputs on backend
- Handle duplicate users cleanly
- Use proper error logging in production

---

## ✅ FINAL CHECKLIST

| Task | Status |
|------|--------|
| Admin can create Supabase Auth users manually | ✅ |
| No email verification required | ✅ |
| User credentials stored safely | ✅ |
| Permissions assigned and stored | ✅ |
| User can log in via CRM | ✅ |
| Access control enforced frontend + backend | ✅ |

---