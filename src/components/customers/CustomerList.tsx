
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { Customer } from '@/pages/CustomersPage';
import { useCustomers } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';



interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomerId?: number;
  onAddCustomer?: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onSelectCustomer,
  selectedCustomerId,
  onAddCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError, error } = useCustomers();

  // Extract customers from the API response
  const customers = data?.data?.customers || [];

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer: Customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.businessName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Error loading customers: {(error as any)?.message || 'Unknown error'}
        </p>
        <Button variant="outline" onClick={onAddCustomer}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Your First Customer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 mt-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer: Customer) => (
            <div
              key={customer.id}
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                selectedCustomerId === customer.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className={`text-sm ${
                    selectedCustomerId === customer.id
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  }`}>
                    {customer.businessName}
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  customer.status === 'active'
                    ? selectedCustomerId === customer.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-green-100 text-green-800'
                    : customer.status === 'lead'
                    ? selectedCustomerId === customer.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-blue-100 text-blue-800'
                    : selectedCustomerId === customer.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </div>
              </div>
              <div className={`text-sm ${
                selectedCustomerId === customer.id
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              }`}>
                {customer.email}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No customers found. Add your first customer to get started.
            </p>
            {onAddCustomer && (
              <Button variant="outline" onClick={onAddCustomer}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
