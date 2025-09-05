import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, User, Mail, Calendar, Building, Key, Copy } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useEmployees } from '@/hooks/useEmployees';
import adminService, { CreateUserData, AdminUser } from '@/lib/admin/adminService';
import { getRoles, type RoleWithPermissions } from '@/lib/admin/roleService';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface UserManagementProps {
  onUserCreate?: (userData: CreateUserData) => void;
  onUserUpdate?: (userId: string, userData: Partial<CreateUserData>) => void;
  onUserDelete?: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserCreate,
  onUserUpdate,
  onUserDelete
}) => {
  const { users, isLoading, error, createUser, deleteUser, isCreating, isDeleting } = useAdminUsers();
  const { data: employees = [] } = useEmployees();

  // Fetch roles from database
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Clear passwords after 30 minutes for security
  useEffect(() => {
    const interval = setInterval(() => {
      setUserPasswords({});
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Form state for creating new user
  const [formData, setFormData] = useState({
    employee_id: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Function to generate email from employee name
  const generateEmail = (fullName: string) => {
    if (!fullName) return '';
    
    // Convert name to lowercase and replace spaces with dots
    const emailName = fullName
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    
    return `${emailName}@logicworks.com`;
  };

  // Function to generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Function to regenerate password for existing user
  const regeneratePassword = async (userId: string, email: string) => {
    const newPassword = generatePassword();
    
    try {
      // Update password in MySQL Auth
      const response = await apiClient.updateUser(userId, {
        password: newPassword
      });

      if (!response.error) {
        // Store the new password
        setUserPasswords(prev => ({
          ...prev,
          [email]: newPassword
        }));
        
        alert(`Password updated successfully!\n\nNew Password: ${newPassword}\n\nPlease save this password securely.`);
      } else {
        alert('Failed to update password. Please try again.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    }
  };

     const handleCreateUser = async (e: React.FormEvent) => {
     e.preventDefault();

     if (!formData.employee_id) {
       setFormError('Please select an employee');
       return;
     }

     if (!formData.password) {
       setFormError('Please enter a password');
       return;
     }

     if (!selectedRoleTemplate) {
       setFormError('Please select a role template');
       return;
     }

    try {
      const roleTemplate = roles.find(role => role.id === selectedRoleTemplate);
      if (!roleTemplate) {
        setFormError('Invalid role');
        return;
      }

      const userData: CreateUserData = {
        employee_id: formData.employee_id,
        password: formData.password,
        permissions: roleTemplate.permissions.map(p => ({
          module: p.module_name,
          can_create: p.can_create,
          can_read: p.can_read,
          can_update: p.can_update,
          can_delete: p.can_delete,
          screen_visible: p.screen_visible
        })),
        role_id: selectedRoleTemplate // Add role_id to the request
      };

      // Use the admin service to create user
      const createdUser = await adminService.createUser(userData);

      // Show success message with credentials
      const employee = employees.find(emp => emp.id === formData.employee_id);
      if (employee && createdUser) {
        const userManagementEmail = createdUser.user_management_email || createdUser.email;
        alert(`User created successfully!\n\nCredentials:\nEmail: ${userManagementEmail}\nPassword: ${formData.password}\n\nPlease save these credentials securely.`);
        
        // Store the password for later viewing (temporarily)
        setUserPasswords(prev => ({
          ...prev,
          [userManagementEmail]: formData.password
        }));
      }

      // Reset form
      setFormData({
        employee_id: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setSelectedRoleTemplate('');
      setIsCreateDialogOpen(false);
      setFormError(null);
    } catch (error) {
      setFormError('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewUserDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    setShowPassword(false); // Reset password visibility
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.full_name || 'Unknown';
  };

  if (isLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account by selecting an employee and assigning permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, employee_id: value }));
                    // Auto-generate password when employee is selected
                    setFormData(prev => ({ ...prev, password: generatePassword(), confirmPassword: generatePassword() }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Email will be generated automatically when you select an employee</p>
              </div>

               <div className="space-y-2">
                 <Label htmlFor="password">Password (Auto-generated)</Label>
                 <div className="flex items-center space-x-2">
                   <Input
                     id="password"
                     type="text"
                     value={formData.password}
                     readOnly
                     className="bg-gray-50 font-mono text-sm"
                   />
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => formData.password && navigator.clipboard.writeText(formData.password)}
                     disabled={!formData.password}
                   >
                     Copy
                   </Button>
                 </div>
                 <p className="text-xs text-gray-500">Password will be generated automatically</p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <Input
                   id="confirmPassword"
                   type="text"
                   value={formData.confirmPassword}
                   readOnly
                   className="bg-gray-50 font-mono text-sm"
                 />
                 <p className="text-xs text-gray-500">Passwords are auto-generated and matched</p>
               </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRoleTemplate}
                  onValueChange={setSelectedRoleTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name} - {role.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

                 {/* View User Details Dialog */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
           <DialogContent className="sm:max-w-[500px]">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 <User className="h-5 w-5" />
                 User Details
               </DialogTitle>
             </DialogHeader>
             {selectedUser && (
               <div className="space-y-4">
                 {/* Basic Info Card */}
                 <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">Name</span>
                     <span className="text-sm font-semibold">{selectedUser.employee.full_name}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">User Management Email</span>
                     <span className="text-sm font-semibold">{selectedUser.user_management_email || selectedUser.email}</span>
                   </div>
                   {selectedUser.employee.personal_email && (
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-gray-600">Personal Email</span>
                       <span className="text-sm font-semibold">{selectedUser.employee.personal_email}</span>
                     </div>
                   )}
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">Job Title</span>
                     <span className="text-sm font-semibold">{selectedUser.employee.job_title}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">Role</span>
                     <span className="text-sm font-semibold">
                       {selectedUser.role ? (
                         <div>
                           <div className="font-medium">{selectedUser.role.display_name}</div>
                           <div className="text-xs text-gray-500">{selectedUser.role.description}</div>
                         </div>
                       ) : (
                         <span className="text-gray-400">No role assigned</span>
                       )}
                     </span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">Status</span>
                     <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                       {selectedUser.status}
                     </Badge>
                   </div>
                 </div>

                 

                 {/* Password Card */}
                 <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                   <h4 className="text-sm font-medium text-gray-700 mb-2">Password</h4>
                   <div className="flex items-center gap-2">
                     <Input 
                       value={userPasswords[selectedUser.email] || 'Password not available'} 
                       readOnly 
                       className="text-xs font-mono"
                       type={showPassword ? "text" : "password"}
                     />
                     {userPasswords[selectedUser.email] && (
                       <>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0"
                           onClick={() => setShowPassword(!showPassword)}
                         >
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0"
                           onClick={() => navigator.clipboard.writeText(userPasswords[selectedUser.email])}
                         >
                           <Copy className="h-4 w-4" />
                         </Button>
                       </>
                     )}
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => regeneratePassword(selectedUser.id, selectedUser.email)}
                     className="w-full"
                   >
                     Regenerate Password
                   </Button>
                   {!userPasswords[selectedUser.email] && (
                     <p className="text-xs text-gray-500 text-center">
                       Use "Regenerate Password" to set a new password
                     </p>
                   )}
                 </div>

                 {/* Action Buttons */}
                 <div className="flex justify-end pt-2">
                   <Button
                     variant="outline"
                     onClick={() => setIsViewDialogOpen(false)}
                   >
                     Close
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all user accounts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.employee.full_name}</TableCell>
                  <TableCell>{user.user_management_email || user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <div>
                        <div className="font-medium">{user.role.display_name}</div>
                        <div className="text-xs text-gray-500">{user.role.description}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No role assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement; 