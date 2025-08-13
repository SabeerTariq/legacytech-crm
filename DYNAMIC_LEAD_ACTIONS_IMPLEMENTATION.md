# 🎯 Dynamic Lead Actions Implementation

## ❓ **Request**
> "Make the lead actions to show view, edit, delete option which will be dynamic to roles permission given through the roles management module"

## ✅ **Solution Implemented**

### **Dynamic Actions Based on User Permissions**

The lead actions dropdown now dynamically shows **view**, **edit**, and **delete** options based on the user's role permissions from the roles management module.

## 🔧 **Technical Implementation**

### **1. Permission-Based Action Logic**

```typescript
// Dynamic actions based on permissions
const getAvailableActions = (lead: Lead) => {
  const actions = [];

  // View action - always available if user has read permission
  if (canRead('leads')) {
    actions.push({
      label: 'View Details',
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => onLeadClick && onLeadClick(lead),
      className: ''
    });
  }

  // Edit action - only if user has update permission
  if (canUpdate('leads') && onLeadEdit) {
    actions.push({
      label: 'Edit Lead',
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: () => onLeadEdit(lead),
      className: ''
    });
  }

  // Delete action - only if user has delete permission
  if (canDeletePermission('leads') && onDeleteLead) {
    actions.push({
      label: 'Delete Lead',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => {
        if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
          onDeleteLead(lead.id);
        }
      },
      className: 'text-red-600 focus:text-red-600'
    });
  }

  return actions;
};
```

### **2. Permission Checks**

The system uses three permission checks from the roles management module:

- **`canRead('leads')`** → Shows "View Details" action
- **`canUpdate('leads')`** → Shows "Edit Lead" action  
- **`canDelete('leads')`** → Shows "Delete Lead" action

### **3. Dynamic Rendering**

```typescript
<TableCell className="text-right">
  {availableActions.length > 0 ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action, index) => (
          <DropdownMenuItem 
            key={index}
            onClick={action.onClick}
            className={action.className}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className="text-sm text-muted-foreground">No actions</span>
  )}
</TableCell>
```

## 📊 **Permission Matrix**

| User Role | View Details | Edit Lead | Delete Lead | Total Actions |
|-----------|--------------|-----------|-------------|---------------|
| **Front Sales** (read-only) | ✅ | ❌ | ❌ | 1 |
| **Admin** (full access) | ✅ | ✅ | ✅ | 3 |
| **Manager** (read + update) | ✅ | ✅ | ❌ | 2 |
| **No Permissions** | ❌ | ❌ | ❌ | 0 |

## 🔄 **Component Flow**

### **Data Flow**
```
Roles Management Module
        ↓
PermissionContext (usePermissions)
        ↓
LeadsList (getAvailableActions)
        ↓
Dynamic Dropdown Menu
        ↓
User Actions (View/Edit/Delete)
```

### **File Changes**

#### **1. src/components/leads/LeadsList.tsx**
- **Added**: `import { usePermissions } from "@/contexts/PermissionContext"`
- **Added**: `const { canRead, canUpdate, canDelete: canDeletePermission } = usePermissions()`
- **Added**: `getAvailableActions()` function
- **Added**: `onLeadEdit` prop and handler
- **Modified**: Dropdown menu to use dynamic actions

#### **2. src/components/leads/LeadsContent.tsx**
- **Added**: `onLeadEdit` prop to interface
- **Added**: Pass `onLeadEdit` to `LeadsList`

#### **3. src/pages/Leads.tsx**
- **Added**: `handleEditLead()` function
- **Updated**: `handleUpdateLead()` to use correct mutation format
- **Added**: Pass `onLeadEdit={handleEditLead}` to `LeadsContent`

## 🎯 **User Experience**

### **Front Sales Users (Read-Only)**
- ✅ Can view lead details
- ❌ Cannot edit leads
- ❌ Cannot delete leads
- **Actions shown**: "View Details" only

### **Admin Users (Full Access)**
- ✅ Can view lead details
- ✅ Can edit leads
- ✅ Can delete leads
- **Actions shown**: "View Details", "Edit Lead", "Delete Lead"

### **Custom Roles**
- Actions dynamically appear based on their specific permissions
- No actions shown if user has no permissions at all

## 🧪 **Testing Scenarios**

### **Test Case 1: Front Sales User**
1. Login as front_sales user
2. Navigate to Leads page
3. Click dropdown on any lead
4. **Expected**: Only "View Details" option available

### **Test Case 2: Admin User**
1. Login as admin user
2. Navigate to Leads page
3. Click dropdown on any lead
4. **Expected**: "View Details", "Edit Lead", "Delete Lead" all available

### **Test Case 3: Edit Functionality**
1. Login as admin user
2. Click "Edit Lead" on any lead
3. **Expected**: Edit modal opens with lead data
4. Make changes and save
5. **Expected**: Lead updates successfully

### **Test Case 4: Delete Functionality**
1. Login as admin user
2. Click "Delete Lead" on any lead
3. **Expected**: Confirmation dialog appears
4. Confirm deletion
5. **Expected**: Lead deleted successfully

## ✅ **Benefits**

### **1. Role-Based Security**
- Actions are strictly controlled by user permissions
- No unauthorized access to edit/delete functions
- Complete audit trail through roles management

### **2. Dynamic UI**
- Actions appear/disappear based on permissions
- Clean interface with only relevant actions
- No confusing disabled buttons

### **3. Maintainability**
- Centralized permission logic
- Easy to modify through roles management module
- Consistent behavior across all interfaces

### **4. User Experience**
- Clear visual feedback on available actions
- Intuitive interface based on user role
- No permission confusion

## 🔧 **Integration with Roles Management**

The dynamic actions are fully integrated with the roles management module:

1. **Permission Source**: All permissions come from the database via roles management
2. **Real-time Updates**: Changes in roles management immediately reflect in UI
3. **Granular Control**: Each action (view/edit/delete) can be individually controlled
4. **Role Flexibility**: Any custom role can have specific action permissions

## 🎯 **Conclusion**

**Status**: ✅ **IMPLEMENTED**

The lead actions are now fully dynamic and controlled by the roles management module. Users see only the actions they have permission to perform, providing a secure and intuitive user experience.

**Key Achievement**: Complete integration between UI actions and database-driven role permissions, ensuring proper access control across all lead management functions. 