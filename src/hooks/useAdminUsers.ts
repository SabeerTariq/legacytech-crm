import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService, { CreateUserData, AdminUser } from '@/lib/admin/adminService';
import { useToast } from '@/hooks/use-toast';

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
    staleTime: 0, // Force immediate refresh
    refetchOnWindowFocus: true,
  });

  const createUserMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: (newUser) => {
      toast({
        title: 'Success',
        description: `User ${newUser.employee.full_name} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<CreateUserData> }) =>
      adminService.updateUser(userId, userData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update user: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    createUser: createUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
  };
}; 