
import React from 'react';
import { Sale } from '@/pages/SalesPage';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  DollarSign, 
  File, 
  Mail, 
  Phone,
  FileText,
  Edit,
  Trash
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SaleDetailsProps {
  sale: Sale;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({ sale }) => {
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
    
    return services.map(s => serviceMap[s] || s);
  };

  // Function to get tenure name
  const getTenureName = (tenure: string) => {
    const tenureMap: Record<string, string> = {
      'one_time': 'One Time',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'biannual': 'Bi-Annual',
      'annual': 'Annual',
    };
    
    return tenureMap[tenure] || tenure;
  };

  // Function to get payment mode name
  const getPaymentModeName = (mode: string) => {
    const modeMap: Record<string, string> = {
      'cash': 'Cash',
      'check': 'Check',
      'bank_transfer': 'Bank Transfer',
      'credit_card': 'Credit Card',
      'paypal': 'PayPal',
      'stripe': 'Stripe',
      'installments': 'Installments',
    };
    
    return modeMap[mode] || mode;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Sale Date</p>
            <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div>
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Customer Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">{sale.customer.name}</span>
                {sale.customer.businessName && (
                  <span className="text-muted-foreground"> • {sale.customer.businessName}</span>
                )}
              </p>
              <p className="text-sm flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${sale.customer.email}`} className="text-primary hover:underline">
                  {sale.customer.email}
                </a>
              </p>
              <p className="text-sm flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${sale.customer.phone}`} className="hover:underline">
                  {sale.customer.phone}
                </a>
              </p>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              Services
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Services Provided:</p>
                <ul className="list-disc list-inside">
                  {getServiceNames(sale.service).map((service, index) => (
                    <li key={index} className="text-sm">{service}</li>
                  ))}
                </ul>
              </div>
              
              {sale.otherServices && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Other Services:</p>
                  <p className="text-sm">{sale.otherServices}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <p className="text-muted-foreground mb-1">Turnaround Time:</p>
                  <p>{sale.turnaroundTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Service Tenure:</p>
                  <p>{getTenureName(sale.serviceTenure)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              Financial Details
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Value:</p>
                  <p className="font-medium">${sale.saleValue.gross.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Mode:</p>
                  <p>{getPaymentModeName(sale.paymentMode)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cash In:</p>
                  <p>${sale.saleValue.cashIn.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining:</p>
                  <p>${sale.saleValue.remaining.toLocaleString()}</p>
                </div>
              </div>
              
              {sale.saleValue.tax && (
                <div className="bg-muted p-2 rounded-sm">
                  <p className="text-sm flex justify-between">
                    <span>Tax Amount:</span>
                    <span>${sale.saleValue.tax.toLocaleString()}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Sale Type:</p>
                <p>{sale.saleType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Front Seller:</p>
                <p>{sale.frontSeller}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Sales Source:</p>
                <p>{sale.salesSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Lead Source:</p>
                <p>{sale.leadSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
            </div>
            
            {sale.agreement && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Agreement Document:</p>
                <a 
                  href="#"
                  className="text-sm text-primary hover:underline flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Downloading agreement document...');
                  }}
                >
                  <File className="h-4 w-4 mr-2" />
                  View Agreement
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" className="flex items-center">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" className="flex items-center">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};
