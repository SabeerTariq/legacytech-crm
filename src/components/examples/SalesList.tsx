import React, { useState } from 'react';
import { useSales, useMySales, useCreateSale, useUpdateSale, useDeleteSale, useCustomers } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface SaleFormData {
  customerId: number;
  services: string[];
  otherServices?: string;
  turnaroundTime: string;
  serviceTenure: string;
  paymentMode: string;
  salesSource: string;
  leadSource: string;
  saleType: string;
  grossValue: number;
  cashIn: number;
  remaining: number;
  tax?: number;
}

export const SalesList = () => {
  const { user } = useAuth();
  const { data: salesData, isLoading, isError, error } = useSales();
  const { data: mySalesData, isLoading: isLoadingMySales } = useMySales();
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [showOnlyMySales, setShowOnlyMySales] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>({
    customerId: 0,
    services: [],
    otherServices: '',
    turnaroundTime: '',
    serviceTenure: '',
    paymentMode: '',
    salesSource: '',
    leadSource: '',
    saleType: '',
    grossValue: 0,
    cashIn: 0,
    remaining: 0,
    tax: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'grossValue' || name === 'cashIn' || name === 'remaining' || name === 'tax' 
        ? parseFloat(value) 
        : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name === 'customerId' ? parseInt(value, 10) : value }));
  };

  const resetForm = () => {
    setFormData({
      customerId: 0,
      services: [],
      otherServices: '',
      turnaroundTime: '',
      serviceTenure: '',
      paymentMode: '',
      salesSource: '',
      leadSource: '',
      saleType: '',
      grossValue: 0,
      cashIn: 0,
      remaining: 0,
      tax: 0,
    });
    setSelectedSaleId(null);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSaleMutation.mutateAsync({
        ...formData,
        date: new Date(),
        sellerId: user?.id,
        status: 'pending',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  const handleEditSale = (sale: any) => {
    setSelectedSaleId(sale.id);
    setFormData({
      customerId: sale.customerId,
      services: sale.services || [],
      otherServices: sale.otherServices || '',
      turnaroundTime: sale.turnaroundTime,
      serviceTenure: sale.serviceTenure,
      paymentMode: sale.paymentMode,
      salesSource: sale.salesSource,
      leadSource: sale.leadSource,
      saleType: sale.saleType,
      grossValue: sale.grossValue,
      cashIn: sale.cashIn,
      remaining: sale.remaining,
      tax: sale.tax || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleId) return;

    try {
      await updateSaleMutation.mutateAsync({
        id: selectedSaleId,
        saleData: formData,
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update sale:', error);
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSaleMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete sale:', error);
      }
    }
  };

  if (isLoading || isLoadingMySales || isLoadingCustomers) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading sales: {(error as any)?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const sales = showOnlyMySales 
    ? (mySalesData?.data?.sales || [])
    : (salesData?.data?.sales || []);
  
  const customers = customersData?.data?.customers || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales</h2>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowOnlyMySales(!showOnlyMySales)}
          >
            {showOnlyMySales ? 'Show All Sales' : 'Show My Sales'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>
                  Fill in the details to record a new sale.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSale}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerId" className="text-right">
                      Customer
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.customerId.toString()}
                        onValueChange={(value) => handleSelectChange('customerId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name} ({customer.businessName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="services" className="text-right">
                      Services
                    </Label>
                    <Input
                      id="services"
                      name="services"
                      value={formData.services.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value.split(',').map(s => s.trim()) }))}
                      className="col-span-3"
                      placeholder="Web Design, SEO, Marketing"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="otherServices" className="text-right">
                      Other Services
                    </Label>
                    <Input
                      id="otherServices"
                      name="otherServices"
                      value={formData.otherServices}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="turnaroundTime" className="text-right">
                      Turnaround Time
                    </Label>
                    <Input
                      id="turnaroundTime"
                      name="turnaroundTime"
                      value={formData.turnaroundTime}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="2 weeks"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serviceTenure" className="text-right">
                      Service Tenure
                    </Label>
                    <Input
                      id="serviceTenure"
                      name="serviceTenure"
                      value={formData.serviceTenure}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="1 year"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paymentMode" className="text-right">
                      Payment Mode
                    </Label>
                    <Input
                      id="paymentMode"
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Credit Card"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="salesSource" className="text-right">
                      Sales Source
                    </Label>
                    <Input
                      id="salesSource"
                      name="salesSource"
                      value={formData.salesSource}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Website"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="leadSource" className="text-right">
                      Lead Source
                    </Label>
                    <Input
                      id="leadSource"
                      name="leadSource"
                      value={formData.leadSource}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Referral"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="saleType" className="text-right">
                      Sale Type
                    </Label>
                    <Input
                      id="saleType"
                      name="saleType"
                      value={formData.saleType}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="New"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grossValue" className="text-right">
                      Gross Value
                    </Label>
                    <Input
                      id="grossValue"
                      name="grossValue"
                      type="number"
                      value={formData.grossValue}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cashIn" className="text-right">
                      Cash In
                    </Label>
                    <Input
                      id="cashIn"
                      name="cashIn"
                      type="number"
                      value={formData.cashIn}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="remaining" className="text-right">
                      Remaining
                    </Label>
                    <Input
                      id="remaining"
                      name="remaining"
                      type="number"
                      value={formData.remaining}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tax" className="text-right">
                      Tax
                    </Label>
                    <Input
                      id="tax"
                      name="tax"
                      type="number"
                      value={formData.tax}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createSaleMutation.isPending}>
                    {createSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Gross Value</TableHead>
              <TableHead>Cash In</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {sale.customer?.name || `Customer #${sale.customerId}`}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(sale.services) 
                      ? sale.services.join(', ') 
                      : typeof sale.services === 'string' 
                        ? sale.services 
                        : 'N/A'}
                  </TableCell>
                  <TableCell>${sale.grossValue.toFixed(2)}</TableCell>
                  <TableCell>${sale.cashIn.toFixed(2)}</TableCell>
                  <TableCell>${sale.remaining.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sale.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : sale.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSale(sale)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSale(sale.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>
              Update the sale details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSale}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-customerId" className="text-right">
                  Customer
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.customerId.toString()}
                    onValueChange={(value) => handleSelectChange('customerId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} ({customer.businessName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Repeat the same fields as in the create form */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-services" className="text-right">
                  Services
                </Label>
                <Input
                  id="edit-services"
                  name="services"
                  value={formData.services.join(', ')}
                  onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value.split(',').map(s => s.trim()) }))}
                  className="col-span-3"
                  placeholder="Web Design, SEO, Marketing"
                  required
                />
              </div>
              {/* Add the rest of the fields similar to the create form */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-grossValue" className="text-right">
                  Gross Value
                </Label>
                <Input
                  id="edit-grossValue"
                  name="grossValue"
                  type="number"
                  value={formData.grossValue}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cashIn" className="text-right">
                  Cash In
                </Label>
                <Input
                  id="edit-cashIn"
                  name="cashIn"
                  type="number"
                  value={formData.cashIn}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-remaining" className="text-right">
                  Remaining
                </Label>
                <Input
                  id="edit-remaining"
                  name="remaining"
                  type="number"
                  value={formData.remaining}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateSaleMutation.isPending}>
                {updateSaleMutation.isPending ? 'Updating...' : 'Update Sale'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
