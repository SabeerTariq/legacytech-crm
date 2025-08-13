# User Deletion Issue Analysis & Solution

## Problem Description

The user `shahbaz.khan@logicworks.com` exists in the Supabase `auth.users` table but doesn't appear in the user management interface. This indicates a data inconsistency between the authentication system and the user management system.

## Root Cause Analysis

### 1. **Data Architecture Issue**
The user management system relies on the `user_profiles` table to display users, but there's a disconnect between:
- `auth.users` (Supabase authentication)
- `user_profiles` (Application user data)
- `employees` (Employee information)

### 2. **User Creation Flow Problems**
The current user creation process has several potential failure points:
1. Auth user created successfully
2. User profile creation fails silently
3. Employee linking fails
4. Orphaned auth users remain in the system

### 3. **User Deletion Flow Problems**
The current deletion process:
1. Only deletes from `auth.users`
2. Relies on CASCADE constraints
3. Doesn't handle orphaned users properly
4. Doesn't clean up related data consistently

## Current System Architecture

### Database Tables
```sql
-- Authentication users (Supabase managed)
auth.users (id, email, created_at, ...)

-- Application user profiles
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  attributes JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Employee data
employees (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  department TEXT,
  job_title TEXT,
  ...
)
```

### User Management Query
```typescript
// Current query in adminService.ts
const { data: userProfiles } = await supabase
  .from('user_profiles')
  .select(`
    *,
    employees:employees(*)
  `)
  .order('created_at', { ascending: false });
```

**Problem**: This query only returns users that have entries in `user_profiles`, missing orphaned auth users.

## Solution Implementation

### 1. **Database Functions for Safe Operations**

#### Safe Delete Function
```sql
CREATE OR REPLACE FUNCTION safe_delete_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  auth_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF auth_user_id IS NULL THEN
    RETURN 'User not found in auth.users';
  END IF;
  
  -- Delete from user_profiles first (if exists)
  DELETE FROM user_profiles WHERE user_id = auth_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = auth_user_id;
  
  RETURN format('User deleted successfully. Auth user: %s, Profiles deleted: %s', 
                CASE WHEN auth_user_id IS NOT NULL THEN 'YES' ELSE 'NO' END,
                deleted_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Orphaned User Sync Function
```sql
CREATE OR REPLACE FUNCTION sync_orphaned_users()
RETURNS TABLE(email TEXT, action TEXT, result TEXT) AS $$
DECLARE
  orphaned_user RECORD;
BEGIN
  -- Find orphaned auth users and create profiles for them
  FOR orphaned_user IN 
    SELECT au.id, au.email, au.created_at
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.user_id
    WHERE up.user_id IS NULL
      AND au.email LIKE '%@logicworks.com'
  LOOP
    BEGIN
      INSERT INTO user_profiles (user_id, email, display_name, is_active, created_at)
      VALUES (
        orphaned_user.id,
        orphaned_user.email,
        SPLIT_PART(orphaned_user.email, '@', 1),
        true,
        orphaned_user.created_at
      );
      
      RETURN QUERY SELECT orphaned_user.email, 'CREATED_PROFILE' as action, 'SUCCESS' as result;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT orphaned_user.email, 'CREATED_PROFILE' as action, 'FAILED: ' || SQLERRM as result;
    END;
  END LOOP;
  
  -- Find orphaned profiles and delete them
  FOR orphaned_user IN 
    SELECT up.user_id, up.email, up.created_at
    FROM user_profiles up
    LEFT JOIN auth.users au ON up.user_id = au.id
    WHERE au.id IS NULL
  LOOP
    BEGIN
      DELETE FROM user_profiles WHERE user_id = orphaned_user.user_id;
      RETURN QUERY SELECT orphaned_user.email, 'DELETED_ORPHANED_PROFILE' as action, 'SUCCESS' as result;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT orphaned_user.email, 'DELETED_ORPHANED_PROFILE' as action, 'FAILED: ' || SQLERRM as result;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. **Improved Admin Service**

#### Enhanced User Fetching
```typescript
async getUsers(): Promise<AdminUser[]> {
  try {
    // First, sync any orphaned users
    await this.syncOrphanedUsers();

    // Fetch users from user_profiles with employee data
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        employees:employees(*)
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    return userProfiles?.map(profile => ({
      id: profile.user_id,
      employee_id: profile.employee_id || '',
      email: profile.attributes?.user_management_email || profile.email,
      user_management_email: profile.attributes?.user_management_email || profile.email,
      status: profile.is_active ? 'active' : 'disabled',
      created_by_admin_id: '1',
      created_at: profile.created_at,
      employee: {
        id: profile.employees?.id || '',
        full_name: profile.employees?.full_name || profile.employees?.name || profile.display_name,
        email: profile.employees?.email || profile.email,
        department: profile.employees?.department || 'Unknown',
        job_title: profile.employees?.job_title || profile.employees?.position || 'User',
        date_of_joining: profile.employees?.date_of_joining || ''
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
```

#### Enhanced User Deletion
```typescript
async deleteUser(userId: string): Promise<void> {
  try {
    // First, get the user's email for proper deletion
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile for deletion:', profileError);
      // Try to get email from auth.users directly
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authError) {
        throw new Error('User not found');
      }
      
      // Use the safe delete function
      const { data: deleteResult, error: deleteError } = await supabase.rpc('safe_delete_user', {
        user_email: authUser.user.email
      });
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    } else {
      // Use the safe delete function with the profile email
      const { data: deleteResult, error: deleteError } = await supabase.rpc('safe_delete_user', {
        user_email: userProfile.email
      });
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    // Call backend API for additional cleanup if needed
    const response = await fetch(`http://localhost:3001/api/admin/delete-user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Backend deletion warning:', errorData.error);
      // Don't throw error here as the database deletion was successful
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
```

### 3. **Improved API Endpoint**

The new `delete-user-improved.js` API:
- Accepts both `userId` and `userEmail`
- Uses the safe delete function
- Handles orphaned users
- Provides better error handling
- Includes backup auth deletion

## Best Practices for User Management

### 1. **User Creation Flow**
```typescript
// Recommended user creation process
async createUser(userData: CreateUserData): Promise<AdminUser> {
  try {
    // 1. Validate employee exists
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', userData.employee_id)
      .single();

    if (!employee) {
      throw new Error('Employee not found');
    }

    // 2. Generate user management email
    const userManagementEmail = employee.user_management_email || 
      await generateUserEmail(employee.full_name, employee.department);

    // 3. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userManagementEmail,
      password: userData.password,
      email_confirm: true
    });

    if (authError) throw authError;

    // 4. Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authUser.user.id,
        employee_id: userData.employee_id,
        email: userManagementEmail,
        display_name: employee.full_name,
        is_active: true,
        attributes: {
          personal_email: employee.email,
          user_management_email: userManagementEmail
        }
      });

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    // 5. Set permissions
    await this.setUserPermissions(authUser.user.id, userData.permissions);

    return this.formatUserResponse(authUser.user, employee);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
```

### 2. **User Deletion Flow**
```typescript
// Recommended user deletion process
async deleteUser(userId: string): Promise<void> {
  try {
    // 1. Get user information
    const userInfo = await this.getUserInfo(userId);
    
    // 2. Use safe delete function
    const { data: deleteResult, error: deleteError } = await supabase.rpc('safe_delete_user', {
      user_email: userInfo.email
    });

    if (deleteError) throw deleteError;

    // 3. Log the deletion
    await this.logUserDeletion(userId, userInfo.email);

    // 4. Notify relevant systems
    await this.notifyUserDeletion(userId);

  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
```

### 3. **Data Consistency Checks**
```typescript
// Regular maintenance function
async performDataConsistencyCheck(): Promise<void> {
  try {
    // 1. Sync orphaned users
    await this.syncOrphanedUsers();

    // 2. Check for data inconsistencies
    const inconsistencies = await this.findDataInconsistencies();

    // 3. Log and fix issues
    for (const issue of inconsistencies) {
      await this.fixDataInconsistency(issue);
    }

    // 4. Generate report
    await this.generateConsistencyReport();
  } catch (error) {
    console.error('Data consistency check failed:', error);
  }
}
```

## Implementation Steps

### Phase 1: Immediate Fix
1. ✅ Apply the database functions (`fix-user-deletion-issue.sql`)
2. ✅ Update the admin service with improved deletion logic
3. ✅ Create the improved delete API endpoint
4. ✅ Test the deletion of the problematic user

### Phase 2: System Improvements
1. 🔄 Update user creation flow to be more robust
2. 🔄 Add data consistency checks
3. 🔄 Implement better error handling
4. 🔄 Add user management audit logs

### Phase 3: Monitoring & Maintenance
1. 📊 Add monitoring for orphaned users
2. 📊 Implement automated cleanup jobs
3. 📊 Create user management dashboards
4. 📊 Add data integrity alerts

## Testing the Solution

### Test Cases
1. **Delete existing user with profile**: Should work normally
2. **Delete orphaned auth user**: Should be handled by sync function
3. **Delete user with missing profile**: Should use safe delete
4. **Delete user with related data**: Should clean up properly
5. **Handle deletion errors**: Should provide clear error messages

### Verification Steps
```sql
-- Check current state
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users WHERE email = 'shahbaz.khan@logicworks.com'
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles WHERE email = 'shahbaz.khan@logicworks.com';

-- Test safe delete
SELECT safe_delete_user('shahbaz.khan@logicworks.com');

-- Verify deletion
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users WHERE email = 'shahbaz.khan@logicworks.com'
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles WHERE email = 'shahbaz.khan@logicworks.com';
```

## Conclusion

The user deletion issue stems from data inconsistency between the authentication system and the user management system. The solution provides:

1. **Safe deletion functions** that handle edge cases
2. **Orphaned user synchronization** to maintain data consistency
3. **Improved user management service** with better error handling
4. **Enhanced API endpoints** for robust operations
5. **Best practices** for future user management operations

This approach ensures that users can be properly deleted regardless of their current state in the system, and prevents similar issues from occurring in the future. 