# 🔐 Supabase Admin User Creation – Safe Integration Plan for CRM

This guide outlines how to manually create users in Supabase Auth (with passwords and no email verification) without disrupting your current CRM built with Supabase, React, and Node.js.

---

## ✅ Objective

- Allow **admin to create CRM users manually**
- Set email + password
- Assign permissions (CRUD + screen visibility)
- Avoid Supabase’s default signup/email verification
- Integrate smoothly without affecting existing login/auth flow

---

## 🧩 Step-by-Step Integration Plan

### 1. Supabase Admin SDK Setup (Backend Only)

**Create file: `/utils/supabaseAdmin.js`**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // store in .env
)

export default supabaseAdmin
```

> ⚠️ Never expose the service role key on the frontend.

---

### 2. Create Backend API: `/api/admin/create-user`

```js
// In your Express backend
router.post('/create-user', async (req, res) => {
  const { employee_id, email, password, permissions } = req.body

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) return res.status(500).json({ error: error.message })

  const user_id = data.user.id

  // Insert into your local CRM users table
  await db('users').insert({
    id: user_id,
    employee_id,
    email,
    created_by_admin_id: req.admin_id
  })

  // Assign permissions
  const perms = permissions.map(p => ({ user_id, ...p }))
  await db('permissions').insert(perms)

  return res.status(200).json({ message: 'User created successfully' })
})
```

---

### 3. Admin Panel Form (Frontend React)

- Select employee
- Enter email and password
- Select module permissions
- Submit form → calls backend

```ts
await axios.post('/api/admin/create-user', {
  employee_id,
  email,
  password,
  permissions
})
```

✅ You don’t need to change your current login form — continue using:

```ts
supabase.auth.signInWithPassword({ email, password })
```

---

### 4. Benefits

| Benefit | Explanation |
|---------|-------------|
| No email verification | Admin sets `email_confirm: true` |
| Custom passwords | Can be securely set by admin |
| Safe | Service key is backend-only |
| No frontend breakage | Existing login stays unchanged |
| Works with permission system | New users assigned screen/module access immediately |

---

## 🛡️ Security Tips

- Keep your **Service Role Key** secure in `.env`
- Restrict `/api/admin/create-user` to admin roles only
- Do not expose any auth logic in frontend

---

## ✅ Summary

| Feature | Supported |
|---------|-----------|
| Manual user creation | ✅ via backend admin API |
| Custom password | ✅ |
| No email verification | ✅ |
| CRM login unaffected | ✅ |
| Secure | ✅ backend only |
| Permissions assigned | ✅ immediately |

---