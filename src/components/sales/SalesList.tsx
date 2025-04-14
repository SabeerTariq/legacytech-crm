
import React, { useState } from 'react';
import { Sale } from '@/pages/SalesPage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SaleDetails } from './SaleDetails';
import { PlusIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock sales data
const MOCK_SALES: Sale[] = [
  {
    id: '1',
    date: '2024-03-25',
    customer: {
      id: '1',
      name: 'John Smith',
      businessName: 'Smith Enterprises',
      email: 'john@smithenterprises.com',
      phone: '(555) 123-4567',
    },
    service: ['website_design', 'seo'],
    turnaroundTime: '4 weeks',
    serviceTenure: 'one_time',
    paymentMode: 'credit_card',
    salesSource: 'direct',
    leadSource: 'website',
    saleType: 'new',
    saleValue: {
      gross: 5000,
      cashIn: 2500,
      remaining: 2500,
      tax: 150,
    },
    frontSeller: 'Admin User',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-03-15',
    customer: {
      id: '2',
      name: 'Sarah Johnson',
      businessName: 'Johnson Digital',
      email: 'sarah@johnsondigital.com',
      phone: '(555) 987-6543',
    },
    service: ['social_media', 'content_creation'],
    turnaroundTime: 'Ongoing',
    serviceTenure: 'monthly',
    paymentMode: 'bank_transfer',
    salesSource: 'direct',
    leadSource: 'referral',
    saleType: 'new',
    saleValue: {
      gross: 1200,
      cashIn: 1200,
      remaining: 0,
    },
    frontSeller: 'Sales Rep',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-03-28',
    customer: {
      id: '3',
      name: 'Michael Wong',
      businessName: 'Wong Innovations',
      email: 'michael@wonginnovations.com',
      phone: '(555) 456-7890',
    },
    service: ['mobile_app'],
    otherServices: 'API Integration',
    turnaroundTime: '8 weeks',
    serviceTenure: 'one_time',
    paymentMode: 'installments',
    salesSource: 'partner',
    leadSource: 'trade_show',
    saleType: 'new',
    saleValue: {
      gross: 12000,
      cashIn: 4000,
      remaining: 8000,
    },
    frontSeller: 'Sales Rep',
    status: 'pending',
  },
];

interface SalesListProps {
  filter?: 'all' | 'recent' | 'pending';
}

export const SalesList: React.FC<SalesListProps> = ({ filter = 'all' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Filter sales based on criteria
  const filteredSales = MOCK_SALES.filter((sale) => {
    // Apply search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      sale.customer.name.toLowerCase().includes(searchLower) ||
      sale.customer.businessName.toLowerCase().includes(searchLower) ||
      sale.service.some(s => s.toLowerCase().includes(searchLower));
    
    // Apply tab filter
    let matchesFilter = true;
    if (filter === 'recent') {
      const saleDate = new Date(sale.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesFilter = saleDate >= thirtyDaysAgo;
    } else if (filter === 'pending') {
      matchesFilter = sale.status === 'pending';
    }
    
    return matchesSearch && matchesFilter;
  });
  
  // Function to get service names
  const getServiceNames = (services: string[]) => {
    const serviceMap: Record<string, string> = {
      'website_design': 'Website Design',
      'e_commerce': 'E-Commerce',
      'mobile_app': 'Mobile App',
      'custom_software': 'Custom Software',
      'seo': 'SEO Services',
      'social_media': 'Social Media',
      'content_creation': 'Content Creation',
      'branding': 'Branding',
      'other': 'Other Services',
    };
    
    return services.map(s => serviceMap[s] || s).join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sales..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="border rounded-lg">
        <div className="grid grid-cols-7 py-3 px-4 border-b font-medium text-sm">
          <div>Date</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Services</div>
          <div>Amount</div>
          <div>Status</div>
        </div>
        
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div 
              key={sale.id}
              className="grid grid-cols-7 py-3 px-4 border-b last:border-0 hover:bg-muted/50 text-sm cursor-pointer"
              onClick={() => setSelectedSale(sale)}
            >
              <div className="truncate">{new Date(sale.date).toLocaleDateString()}</div>
              <div className="col-span-2 truncate">
                <div>{sale.customer.name}</div>
                <div className="text-muted-foreground text-xs">{sale.customer.businessName}</div>
              </div>
              <div className="col-span-2 truncate">{getServiceNames(sale.service)}</div>
              <div className="truncate">${sale.saleValue.gross.toLocaleString()}</div>
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  sale.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : sale.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No sales records found
          </div>
        )}
      </div>
      
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        {selectedSale && (
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Sale Details</DialogTitle>
            </DialogHeader>
            <SaleDetails sale={selectedSale} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
