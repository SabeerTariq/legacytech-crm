# 🔧 Supabase Settings Checklist - Fix User Creation Error

## 🚨 **Critical Settings to Check**

### **1. Authentication Settings**
Go to **Supabase Dashboard** → **Authentication** → **Settings**

#### **Email Settings**
- [ ] **Enable email confirmations**: Set to **OFF** (for testing)
- [ ] **Enable email change confirmations**: Set to **OFF**
- [ ] **Enable phone confirmations**: Set to **OFF**
- [ ] **Enable phone change confirmations**: Set to **OFF**

#### **Password Settings**
- [ ] **Minimum password length**: Set to **6** (for testing)
- [ ] **Password strength**: Set to **Weak** (for testing)

#### **Advanced Settings**
- [ ] **Enable sign up**: Set to **ON**
- [ ] **Enable sign in**: Set to **ON**
- [ ] **Enable magic link**: Set to **OFF** (for testing)

### **2. Database Settings**
Go to **Supabase Dashboard** → **Database** → **Settings**

#### **Connection Settings**
- [ ] **Connection string**: Verify it matches your project
- [ ] **Pooler settings**: Check if connection pooling is enabled

#### **RLS (Row Level Security)**
- [ ] **Enable RLS**: Temporarily set to **OFF** for testing
- [ ] **Check RLS policies**: Ensure they're not blocking admin operations

### **3. API Settings**
Go to **Supabase Dashboard** → **Settings** → **API**

#### **Project API Keys**
- [ ] **Project URL**: Verify it's correct
- [ ] **anon public key**: Verify it matches your frontend
- [ ] **service_role secret key**: Verify it matches your backend

## 🔍 **Database Configuration Fixes**

### **Step 1: Run Database Fix Script**
```sql
-- Copy and paste this in SQL Editor
-- This is the content of quick-database-fix.sql
-- (The full script is in your quick-database-fix.sql file)
```

### **Step 2: Check for Database Triggers**
```sql
-- Check for problematic triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';
```

### **Step 3: Temporarily Disable RLS**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- Test user creation here

-- Re-enable RLS after testing
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
```

## 🛠️ **Alternative Solutions**

### **Solution 1: Use Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yipyteszzyycbqgzpfrf

# Reset database (WARNING: This will delete all data)
supabase db reset

# Or just push migrations
supabase db push
```

### **Solution 2: Create New Project**
If the issue persists:
1. Create a new Supabase project
2. Copy your data to the new project
3. Update your environment variables
4. Test user creation in the new project

### **Solution 3: Contact Supabase Support**
If none of the above works:
1. Go to **Supabase Dashboard** → **Support**
2. Provide your project details
3. Include the error message and logs
4. Request assistance with the database error

## 🧪 **Testing Steps**

### **Step 1: Test with Minimal Data**
```javascript
// Test this in your browser console or a test script
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'test123',
  employee_id: 'your-employee-id',
  permissions: [
    {
      module: 'dashboard',
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false,
      screen_visible: true
    }
  ]
};
```

### **Step 2: Monitor Backend Logs**
```bash
# Start your backend server
node server.js

# Watch for detailed error messages
# Look for specific database constraint errors
```

### **Step 3: Check Supabase Logs**
1. Go to **Supabase Dashboard** → **Logs**
2. Check **Auth Logs** for detailed error messages
3. Look for specific constraint violations

## 📋 **Common Issues and Solutions**

### **Issue 1: Foreign Key Constraints**
```sql
-- Check for foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_profiles';
```

### **Issue 2: Database Triggers**
```sql
-- Disable all triggers temporarily
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE event_object_schema = 'auth' 
              AND event_object_table = 'users') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.' || r.event_object_table;
    END LOOP;
END $$;
```

### **Issue 3: RLS Policies**
```sql
-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🎯 **Expected Results**

After applying these fixes:
- ✅ User creation works without database errors
- ✅ No more 500 status codes
- ✅ Users appear in the User Management list
- ✅ Permissions are properly assigned
- ✅ Backend logs show successful operations

## 🚨 **If Issues Persist**

1. **Check Supabase Status**: Visit https://status.supabase.com
2. **Contact Support**: Use Supabase support channels
3. **Create New Project**: Start fresh with a new Supabase project
4. **Use Alternative Auth**: Consider using a different authentication provider temporarily

---

**Follow this checklist step by step to resolve the "Database error creating new user" issue!** 🔧 