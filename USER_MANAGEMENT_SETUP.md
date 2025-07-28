# 🔐 User Management System Setup

This guide will help you set up the admin user creation functionality for your CRM system.

## 📋 Prerequisites

- Access to your Supabase project dashboard
- Admin access to your CRM system

## 🚀 Setup Instructions

### Step 1: Run Database Setup Script

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete-setup.sql` into the editor
4. Click **Run** to execute the script

This script will:
- ✅ Add missing columns to the `user_profiles` table
- ✅ Create the `modules` table with default modules
- ✅ Create the `user_permissions` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create the permission assignment function
- ✅ Add necessary indexes for performance

### Step 2: Verify Setup

After running the script, you can verify the setup by running the test script:

```bash
node test-user-creation.js
```

This should show:
- ✅ Employees table accessible
- ✅ User profiles table accessible  
- ✅ Modules table accessible
- ✅ User permissions table accessible

## 🎯 Features Implemented

### ✅ Admin User Creation
- **Employee Selection**: Choose from existing employees in the database
- **Email & Password**: Set custom email and password for new users
- **Role Templates**: Assign predefined permission sets (Admin, Manager, Sales Rep, Viewer)
- **No Email Verification**: Users are created with confirmed email status
- **Automatic Profile Creation**: User profiles are created automatically
- **Permission Assignment**: Permissions are assigned based on role templates

### ✅ User Management Interface
- **User List**: View all created users with their details
- **Employee Information**: Display employee name, department, and position
- **Status Management**: Active/disabled user status
- **Delete Users**: Remove users from the system
- **Real-time Updates**: Automatic refresh after operations

### ✅ Security Features
- **Backend-only Operations**: All admin operations use Supabase admin functions
- **Row Level Security**: Proper RLS policies for data protection
- **Permission-based Access**: Users only see what they're allowed to access
- **Audit Trail**: All operations are logged

## 🔧 How It Works

### 1. User Creation Flow
```
Admin selects employee → Sets email/password → Chooses role → Creates user
     ↓
Supabase Auth user created → Profile created → Permissions assigned
```

### 2. Permission System
- **Modules**: Each feature (leads, customers, etc.) is a module
- **Permissions**: CRUD operations + screen visibility per module
- **Role Templates**: Predefined permission sets for common roles
- **Database Function**: `create_user_permissions_from_template()` handles permission assignment

### 3. Database Schema
```
employees (existing)
├── id, full_name, email, department, job_title, etc.

user_profiles (enhanced)
├── user_id, employee_id, email, is_active, attributes

modules (new)
├── id, name, display_name, description

user_permissions (new)
├── user_id, module_id, can_create, can_read, can_update, can_delete, screen_visible
```

## 🎨 Frontend Components

### UserManagement Component
- **Location**: `src/components/admin/UserManagement.tsx`
- **Features**: 
  - Employee selection dropdown
  - Email/password form
  - Role template selection
  - User list with actions
  - Loading states and error handling

### Admin Service
- **Location**: `src/lib/admin/adminService.ts`
- **Features**:
  - User creation with Supabase Auth
  - Profile creation
  - Permission assignment
  - User management operations

### Admin Hook
- **Location**: `src/hooks/useAdminUsers.ts`
- **Features**:
  - React Query integration
  - Toast notifications
  - Error handling
  - Optimistic updates

## 🔐 Role Templates

### Administrator
- Full access to all modules
- Can manage users and permissions
- Complete CRUD operations

### Manager
- Access to most modules
- Limited admin functions
- Can manage leads, projects, customers

### Sales Representative
- Sales-related modules only
- Lead and customer management
- Personal dashboard access

### Viewer
- Read-only access to assigned modules
- No creation or modification rights

## 🚨 Important Notes

1. **Service Role Key**: The admin operations require the service role key, which is handled securely in the backend
2. **Email Confirmation**: Users are created with `email_confirm: true` to skip verification
3. **Password Security**: Passwords are set by admins and should follow security policies
4. **Permission Inheritance**: Users get permissions based on their assigned role template
5. **Data Integrity**: Foreign key constraints ensure data consistency

## 🐛 Troubleshooting

### Common Issues

1. **"Modules table does not exist"**
   - Run the `complete-setup.sql` script in Supabase SQL Editor

2. **"Permission denied"**
   - Check RLS policies are properly set up
   - Ensure user has admin permissions

3. **"Employee not found"**
   - Verify employees exist in the database
   - Check employee table structure

4. **"User creation failed"**
   - Check Supabase Auth settings
   - Verify service role key permissions

### Testing

Run the test script to verify everything is working:

```bash
node test-user-creation.js
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database setup is complete
3. Ensure all required tables and columns exist
4. Check Supabase Auth settings

---

**🎉 Congratulations!** Your user management system is now ready to use. Admins can create new users from the employee list and assign appropriate permissions. 