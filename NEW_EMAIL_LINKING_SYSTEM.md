# New Email Linking System

## Overview

The CRM system has been updated to use a new email linking system where **user management emails** serve as the primary linking mechanism between users and employees, instead of relying on email matching between `user_profiles` and `employees` tables.

## Key Changes

### 1. **Employee Table Structure**
The `employees` table now has two email fields:
- `personal_email`: The employee's original/personal email address
- `user_management_email`: The system-generated email for user management

### 2. **User Profile Linking**
User profiles are now linked to employees using the `employee_id` field instead of email matching:
- `user_profiles.employee_id` → `employees.id`
- `user_profiles.email` contains the user management email
- `user_profiles.attributes.personal_email` stores the original employee email

### 3. **Email Generation System**
Custom user management emails are generated using the format:
```
firstname.lastname.dept@logicworks.com
```

## Database Schema Changes

### Employees Table
```sql
ALTER TABLE employees ADD COLUMN user_management_email TEXT;
ALTER TABLE employees ADD COLUMN personal_email TEXT;

-- Move existing email to personal_email
UPDATE employees 
SET personal_email = email,
    user_management_email = NULL
WHERE personal_email IS NULL;
```

### User Profiles Table
```sql
-- user_profiles table structure
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    employee_id UUID REFERENCES employees(id),  -- Primary linking field
    email TEXT UNIQUE NOT NULL,                -- User management email
    display_name TEXT,
    is_active BOOLEAN DEFAULT true,
    attributes JSONB DEFAULT '{}',              -- Stores personal_email
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Email Generation Functions

### Generate Employee User Email
```sql
CREATE OR REPLACE FUNCTION generate_employee_user_email(
    employee_full_name TEXT, 
    employee_department TEXT
)
RETURNS TEXT AS $$
DECLARE
    clean_name TEXT;
    dept_prefix TEXT;
    base_email TEXT;
    final_email TEXT;
    counter INTEGER := 1;
BEGIN
    -- Clean the name
    clean_name := lower(regexp_replace(employee_full_name, '[^a-zA-Z\s]', '', 'g'));
    clean_name := regexp_replace(trim(clean_name), '\s+', '.', 'g');
    
    -- Get department prefix (first 3 letters)
    dept_prefix := lower(substring(employee_department, 1, 3));
    
    -- Generate base email
    base_email := clean_name || '.' || dept_prefix || '@logicworks.com';
    final_email := base_email;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE email = final_email) OR
          EXISTS (SELECT 1 FROM employees WHERE user_management_email = final_email) LOOP
        final_email := regexp_replace(base_email, '@', counter || '@');
        counter := counter + 1;
    END LOOP;
    
    RETURN final_email;
END;
$$ LANGUAGE plpgsql;
```

### Sync Employee User Emails
```sql
CREATE OR REPLACE FUNCTION sync_employee_user_emails()
RETURNS VOID AS $$
DECLARE
    emp RECORD;
    user_email TEXT;
BEGIN
    FOR emp IN SELECT id, full_name, department FROM employees WHERE user_management_email IS NULL LOOP
        -- Generate user management email
        user_email := generate_employee_user_email(emp.full_name, emp.department);
        
        -- Update employee with user management email
        UPDATE employees 
        SET user_management_email = user_email
        WHERE id = emp.id;
        
        RAISE NOTICE 'Generated user management email for %: %', emp.full_name, user_email;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Team Performance Function Update

The team performance function now uses the new linking system:

```sql
CREATE OR REPLACE FUNCTION get_team_performance_summary(p_month DATE)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  accounts_achieved INTEGER,
  total_gross NUMERIC,
  total_cash_in NUMERIC,
  total_remaining NUMERIC,
  performance_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fsp.seller_id,
    COALESCE(e.full_name, up.display_name, 'Unknown User') as seller_name,
    fsp.accounts_achieved,
    fsp.total_gross,
    fsp.total_cash_in,
    fsp.total_remaining,
    ROW_NUMBER() OVER (ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC) as performance_rank
  FROM front_seller_performance fsp
  -- Join with user_profiles to get the user management email (primary linking)
  LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
  -- Join with employees using the employee_id link
  LEFT JOIN employees e ON e.id = up.employee_id
  -- Only include performance data for the specified month
  WHERE fsp.month = p_month
  -- Only include employees who are in Front Sales teams or have sales-related emails
  AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
  -- Order by performance
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## User Creation Process

### New User Creation API
The user creation process now:

1. **Fetches employee data** using `employee_id`
2. **Generates user management email** if not already set
3. **Creates auth user** with user management email
4. **Creates user profile** with `employee_id` linking
5. **Stores both emails** in the system

```javascript
// Example user creation flow
const { data: employeeData } = await supabaseAdmin
  .from('employees')
  .select('*')
  .eq('id', employee_id)
  .single();

// Generate user management email
let userManagementEmail = employeeData.user_management_email;
if (!userManagementEmail) {
  const { data: generatedEmail } = await supabaseAdmin.rpc(
    'generate_employee_user_email',
    {
      employee_full_name: employeeData.full_name,
      employee_department: employeeData.department
    }
  );
  userManagementEmail = generatedEmail;
  
  // Update employee with generated email
  await supabaseAdmin
    .from('employees')
    .update({ user_management_email: userManagementEmail })
    .eq('id', employee_id);
}

// Create auth user with user management email
const { data: authData } = await supabaseAdmin.auth.admin.createUser({
  email: userManagementEmail,
  password: password,
  email_confirm: true,
  user_metadata: {
    employee_id: employee_id,
    personal_email: employeeData.personal_email,
    user_management_email: userManagementEmail
  }
});

// Create user profile with employee linking
await supabaseAdmin
  .from('user_profiles')
  .insert({
    user_id: authData.user.id,
    employee_id: employee_id,
    email: userManagementEmail,
    display_name: employeeData.full_name,
    attributes: {
      personal_email: employeeData.personal_email,
      user_management_email: userManagementEmail
    }
  });
```

## Benefits of the New System

### 1. **Clear Separation of Concerns**
- **Personal Email**: Employee's actual email (for reference)
- **User Management Email**: System-generated email (for authentication)

### 2. **Reliable Linking**
- Uses `employee_id` as primary linking field
- No dependency on email matching
- Eliminates email mismatch issues

### 3. **Professional Email System**
- Consistent company email format
- Automatic uniqueness handling
- Department-based email organization

### 4. **Better Security**
- Users don't need to share personal emails
- Admin controls all user accounts
- Clear audit trail

### 5. **Flexibility**
- Can change user management emails without affecting personal accounts
- Easy to manage and maintain
- Supports multiple email formats

## Migration Process

### Step 1: Apply Database Changes
```bash
# Run the migration
psql -d your_database -f update-email-linking-system.sql
```

### Step 2: Generate User Management Emails
```sql
-- Generate user management emails for all employees
SELECT sync_employee_user_emails();
```

### Step 3: Update Existing Users
```sql
-- Update existing user profiles to use employee_id linking
UPDATE user_profiles 
SET employee_id = e.id
FROM employees e 
WHERE user_profiles.email = e.user_management_email
AND user_profiles.employee_id IS NULL;
```

### Step 4: Test the System
```bash
# Run the test script
node test-new-email-linking.js
```

## Monitoring and Maintenance

### Linking Status View
```sql
CREATE OR REPLACE VIEW employee_user_linking_status AS
SELECT 
    e.id as employee_id,
    e.full_name as employee_name,
    e.personal_email as original_email,
    e.user_management_email as system_email,
    e.department,
    up.user_id as auth_user_id,
    up.email as profile_email,
    CASE 
        WHEN up.user_id IS NOT NULL THEN 'LINKED'
        WHEN e.user_management_email IS NOT NULL THEN 'READY_FOR_LINKING'
        ELSE 'NEEDS_EMAIL_GENERATION'
    END as linking_status
FROM employees e
LEFT JOIN user_profiles up ON up.employee_id = e.id
ORDER BY e.full_name;
```

### Check Linking Status
```sql
-- View current linking status
SELECT * FROM employee_user_linking_status WHERE department = 'Front Sales';
```

## Troubleshooting

### Common Issues

1. **Missing User Management Emails**
   ```sql
   -- Generate missing emails
   SELECT sync_employee_user_emails();
   ```

2. **Unlinked User Profiles**
   ```sql
   -- Find unlinked profiles
   SELECT * FROM user_profiles WHERE employee_id IS NULL;
   ```

3. **Email Conflicts**
   ```sql
   -- Check for email conflicts
   SELECT email, COUNT(*) FROM user_profiles GROUP BY email HAVING COUNT(*) > 1;
   ```

### Validation Queries

```sql
-- Check employee email structure
SELECT 
    full_name,
    email as original_email,
    personal_email,
    user_management_email,
    department
FROM employees 
WHERE department = 'Front Sales';

-- Check user profile linking
SELECT 
    up.email as profile_email,
    up.employee_id,
    e.full_name as employee_name,
    e.user_management_email as employee_system_email
FROM user_profiles up
LEFT JOIN employees e ON e.id = up.employee_id
WHERE up.employee_id IS NOT NULL;
```

## Future Enhancements

1. **Email Alias Support**: Multiple email formats per user
2. **Department Customization**: Custom department prefixes
3. **Email Templates**: Configurable email format templates
4. **Bulk Operations**: Enhanced bulk email management tools
5. **Email Validation**: Enhanced email format validation

## Summary

The new email linking system provides:

- ✅ **Reliable linking** between users and employees
- ✅ **Professional email management** with custom company emails
- ✅ **Clear separation** between personal and work emails
- ✅ **Better security** and control over user accounts
- ✅ **Flexible system** that can be easily maintained and extended

This system eliminates the previous email matching issues and provides a robust foundation for user management in the CRM system. 