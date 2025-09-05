import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/contexts/PermissionContext';
import { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole, 
  getModules,
  type Role,
  type RoleWithPermissions,
  type CreateRoleData
} from '@/lib/admin/roleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Shield, Users, Settings } from 'lucide-react';

const RoleManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshPermissions } = usePermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      await refreshPermissions(); // Refresh permissions after role creation
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Role created successfully",
        description: "The new role has been created with the specified permissions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      await refreshPermissions(); // Refresh permissions after role update
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      toast({
        title: "Role updated successfully",
        description: "The role has been updated with the new permissions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      await refreshPermissions(); // Refresh permissions after role deletion
      toast({
        title: "Role deleted successfully",
        description: "The role has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: []
    });
  };

  const handleCreateRole = () => {
    if (!formData.name || !formData.display_name) {
      toast({
        title: "Validation error",
        description: "Name and display name are required.",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate(formData);
  };

  const handleEditRole = (role: RoleWithPermissions) => {
    // Fetch role with permissions
    getRoleById(role.id).then((roleWithPermissions) => {
      setSelectedRole(roleWithPermissions);
      setFormData({
        name: roleWithPermissions.name,
        display_name: roleWithPermissions.display_name,
        description: roleWithPermissions.description || '',
        permissions: roleWithPermissions.permissions.map(p => ({
          module_name: p.module_name,
          can_create: p.can_create,
          can_read: p.can_read,
          can_update: p.can_update,
          can_delete: p.can_delete,
          screen_visible: p.screen_visible
        }))
      });
      setIsEditDialogOpen(true);
    });
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    updateRoleMutation.mutate({
      id: selectedRole.id,
      ...formData
    });
  };

  const handleDeleteRole = (role: RoleWithPermissions) => {
    deleteRoleMutation.mutate(role.id);
  };

  const handlePermissionChange = (moduleName: string, permission: string, checked: boolean) => {
    setFormData(prev => {
      const existingPermission = prev.permissions.find(p => p.module_name === moduleName);
      
      if (existingPermission) {
        return {
          ...prev,
          permissions: prev.permissions.map(p => 
            p.module_name === moduleName 
              ? { ...p, [permission]: checked }
              : p
          )
        };
      } else {
        return {
          ...prev,
          permissions: [
            ...prev.permissions,
            {
              module_name: moduleName,
              can_create: permission === 'can_create' ? checked : false,
              can_read: permission === 'can_read' ? checked : false,
              can_update: permission === 'can_update' ? checked : false,
              can_delete: permission === 'can_delete' ? checked : false,
              screen_visible: permission === 'screen_visible' ? checked : false
            }
          ]
        };
      }
    });
  };

  const getPermissionValue = (moduleName: string, permission: string): boolean => {
    const perm = formData.permissions.find(p => p.module_name === moduleName);
    return perm ? perm[permission as keyof typeof perm] : false;
  };

  const getPermissionCount = (role: RoleWithPermissions): number => {
    return role.permissions ? role.permissions.length : 0;
  };

  if (rolesLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage roles with granular permissions for all modules.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions for different modules.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., sales_manager"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    placeholder="e.g., Sales Manager"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role and its responsibilities..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Module Permissions</h3>
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium">
                      <div>Module</div>
                      <div className="text-center">Create</div>
                      <div className="text-center">Read</div>
                      <div className="text-center">Update</div>
                      <div className="text-center">Delete</div>
                      <div className="text-center">Visible</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {modules.map((module: any) => (
                      <div key={module.name} className="px-4 py-3">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="font-medium">{module.display_name}</div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_create')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_create', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_read')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_read', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_update')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_update', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_delete')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_delete', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'screen_visible')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'screen_visible', checked as boolean)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Manage roles and their permissions. System roles cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.display_name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {role.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_system_role ? "default" : "secondary"}>
                      {role.is_system_role ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {getPermissionCount(role)} permissions
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            disabled={role.is_system_role}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={role.is_system_role}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the role "{role.display_name}"? 
                              This action cannot be undone and will affect all users assigned to this role.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRole(role)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {selectedRole.display_name}</DialogTitle>
              <DialogDescription>
                Modify the role permissions and settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-display_name">Display Name</Label>
                  <Input
                    id="edit-display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Module Permissions</h3>
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium">
                      <div>Module</div>
                      <div className="text-center">Create</div>
                      <div className="text-center">Read</div>
                      <div className="text-center">Update</div>
                      <div className="text-center">Delete</div>
                      <div className="text-center">Visible</div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {modules.map((module: any) => (
                      <div key={module.name} className="px-4 py-3">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="font-medium">{module.display_name}</div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_create')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_create', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_read')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_read', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_update')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_update', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'can_delete')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'can_delete', checked as boolean)
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={getPermissionValue(module.name, 'screen_visible')}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, 'screen_visible', checked as boolean)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoleManagement; 