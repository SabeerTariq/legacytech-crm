# Custom Email System for User Creation

## Overview

The CRM system now uses custom email addresses for user accounts instead of the employees' actual email addresses. This provides better security and control over user access while maintaining a professional email format.

## Email Format

Custom emails follow this format:
```
firstname.lastname.dept@logicworks.com
```

### Examples:
- `john.doe.hr@logicworks.com` (HR department)
- `jane.smith.mar@logicworks.com` (Marketing department)
- `mike.johnson.dev@logicworks.com` (Development department)
- `sarah.wilson.sal@logicworks.com` (Sales department)

## Email Generation Rules

1. **Name Processing:**
   - Convert to lowercase
   - Remove special characters (except spaces)
   - Replace spaces with dots
   - Trim whitespace

2. **Department Prefix:**
   - Take first 3 letters of department name
   - Convert to lowercase

3. **Uniqueness:**
   - If duplicate names exist, append a number
   - Example: `john.doe.hr1@logicworks.com`, `john.doe.hr2@logicworks.com`

## Implementation

### Updated Scripts

1. **`create-user-manual.js`** - Manual user creation with custom emails
2. **`sync-employees-to-users.js`** - Bulk sync with custom emails
3. **`generate-custom-emails.js`** - Preview and test email generation

### Key Functions

```javascript
// Generate base custom email
function generateCustomEmail(fullName, department) {
  const cleanName = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  
  const deptPrefix = department.toLowerCase().substring(0, 3);
  return `${cleanName}.${deptPrefix}@logicworks.com`;
}

// Generate unique custom email
async function generateUniqueCustomEmail(fullName, department) {
  let baseEmail = generateCustomEmail(fullName, department);
  let customEmail = baseEmail;
  let counter = 1;
  
  while (await checkCustomEmailExists(customEmail)) {
    const nameParts = baseEmail.split('@')[0];
    customEmail = `${nameParts}${counter}@logicworks.com`;
    counter++;
  }
  
  return customEmail;
}
```

## Usage

### Manual User Creation

```bash
# Create a user for employee #1
node create-user-manual.js 1 "SecurePassword123"

# The script will:
# 1. Show available employees with their custom email previews
# 2. Generate a unique custom email
# 3. Create the user account
# 4. Display both original and custom emails
```

### Bulk Sync

```bash
# Sync all employees to users with custom emails
node sync-employees-to-users.js

# The script will:
# 1. Process all employees
# 2. Generate unique custom emails for each
# 3. Create user accounts and profiles
# 4. Show progress and results
```

### Email Preview

```bash
# Preview custom emails for all employees
node generate-custom-emails.js

# Shows:
# - Current employees and their custom emails
# - Whether emails are unique or need counters
# - Test cases with various name formats
```

## Database Changes

### User Metadata

The original employee email is stored in user metadata for reference:
```javascript
user_metadata: {
  employee_id: employee.id,
  full_name: employee.full_name,
  department: employee.department,
  job_title: employee.job_title,
  original_email: employee.email // Store original email
}
```

### Profile Table

The `user_profiles` table now includes:
- `email`: Custom email address
- `original_email`: Original employee email (for reference)

## Frontend Integration

### User Management UI

The User Management interface now:
- Shows custom email generation in real-time
- Displays the email format explanation
- Auto-generates emails when employees are selected
- Shows both custom and original emails

### Email Display

When viewing user profiles, both emails are shown:
- **Login Email**: Custom email (for authentication)
- **Original Email**: Employee's actual email (for reference)

## Benefits

1. **Security**: Users don't need to share their personal emails
2. **Control**: Admin controls all user accounts centrally
3. **Professional**: Consistent company email format
4. **Flexibility**: Can change emails without affecting personal accounts
5. **Audit Trail**: Clear separation between personal and work accounts

## Migration Notes

- Existing users with original emails will continue to work
- New users will use the custom email system
- Original emails are preserved in metadata for reference
- No data loss during migration

## Troubleshooting

### Common Issues

1. **Duplicate Emails**: The system automatically handles duplicates by adding numbers
2. **Special Characters**: Names with special characters are cleaned automatically
3. **Long Names**: Very long names are handled by the dot notation system

### Validation

Use the `generate-custom-emails.js` script to:
- Preview all custom emails before creation
- Test email generation with various name formats
- Verify uniqueness across the system

## Future Enhancements

1. **Email Aliases**: Support for multiple email formats per user
2. **Department Customization**: Allow custom department prefixes
3. **Email Templates**: Configurable email format templates
4. **Bulk Operations**: Enhanced bulk email management tools 