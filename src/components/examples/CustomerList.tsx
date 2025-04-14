import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';

interface CustomerFormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address?: string;
  source: string;
}

export const CustomerList = () => {
  const { data: customersData, isLoading, isError, error } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    source: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessName: '',
      email: '',
      phone: '',
      address: '',
      source: '',
    });
    setSelectedCustomerId(null);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomerMutation.mutateAsync({
        ...formData,
        joinDate: new Date(),
        status: 'active',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setFormData({
      name: customer.name,
      businessName: customer.businessName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      source: customer.source,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    try {
      await updateCustomerMutation.mutateAsync({
        id: selectedCustomerId,
        customerData: formData,
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomerMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading customers: {(error as any)?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const customers = customersData?.data?.customers || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new customer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="businessName" className="text-right">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">
                    Source
                  </Label>
                  <Input
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.businessName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.source}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-businessName" className="text-right">
                  Business Name
                </Label>
                <Input
                  id="edit-businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Address
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-source" className="text-right">
                  Source
                </Label>
                <Input
                  id="edit-source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending ? 'Updating...' : 'Update Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
