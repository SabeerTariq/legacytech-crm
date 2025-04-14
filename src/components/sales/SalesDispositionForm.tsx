
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import { toast } from 'sonner';

// Form schema
const formSchema = z.object({
  date: z.date({
    required_error: "Sale date is required",
  }),
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerBusiness: z.string().optional(),
  services: z.array(z.string()).min(1, "At least one service must be selected"),
  otherServices: z.string().optional(),
  turnaroundTime: z.string().min(1, "Turnaround time is required"),
  serviceTenure: z.string().min(1, "Service tenure is required"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  salesSource: z.string().min(1, "Sales source is required"),
  leadSource: z.string().min(1, "Lead source is required"),
  saleType: z.string().min(1, "Sale type is required"),
  grossValue: z.coerce.number().min(1, "Gross value is required"),
  cashIn: z.coerce.number().min(0, "Cash in amount is required"),
  // Optionally uploaded agreement file
  agreement: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Service options
const serviceOptions = [
  { id: 'website_design', label: 'Website Design' },
  { id: 'e_commerce', label: 'E-Commerce Development' },
  { id: 'mobile_app', label: 'Mobile App Development' },
  { id: 'custom_software', label: 'Custom Software' },
  { id: 'seo', label: 'SEO Services' },
  { id: 'social_media', label: 'Social Media Management' },
  { id: 'content_creation', label: 'Content Creation' },
  { id: 'branding', label: 'Branding & Design' },
];

interface SalesDispositionFormProps {
  onSuccess: () => void;
}

export const SalesDispositionForm: React.FC<SalesDispositionFormProps> = ({ onSuccess }) => {
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [isOtherServices, setIsOtherServices] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      services: [],
      otherServices: '',
      grossValue: 0,
      cashIn: 0,
    },
  });

  const selectedPaymentMode = form.watch('paymentMode');
  
  // Calculate remaining amount and tax
  const grossValue = form.watch('grossValue') || 0;
  const cashIn = form.watch('cashIn') || 0;
  const remaining = grossValue - cashIn;
  
  // Calculate tax (only for certain payment modes)
  const calculateTax = () => {
    if (['credit_card', 'paypal', 'stripe'].includes(selectedPaymentMode || '')) {
      return grossValue * 0.03; // 3% tax
    }
    return 0;
  };
  
  const tax = calculateTax();

  const onSubmit = (data: FormValues) => {
    // In a real app, this would be an API call to save the sale
    console.log('Form submitted:', data);
    console.log('Calculated remaining:', remaining);
    console.log('Calculated tax:', tax);
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success('Sale recorded successfully');
      onSuccess();
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sale Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sale Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Customer Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="existing-customer"
                checked={isExistingCustomer}
                onCheckedChange={(checked) => setIsExistingCustomer(checked === true)}
              />
              <label
                htmlFor="existing-customer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Existing Customer
              </label>
            </div>
            
            {isExistingCustomer ? (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">John Smith - Smith Enterprises</SelectItem>
                        <SelectItem value="2">Sarah Johnson - Johnson Digital</SelectItem>
                        <SelectItem value="3">Michael Wong - Wong Innovations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </div>
        
        {/* Customer Details */}
        {!isExistingCustomer && (
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith Enterprises" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        {/* Services */}
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-4">Services Sold</h3>
          <FormField
            control={form.control}
            name="services"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {serviceOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="services"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, option.id]
                                    : field.value?.filter(
                                        (value) => value !== option.id
                                      );
                                  field.onChange(updatedValue);
                                  
                                  // Set "Other" flag if "Other" is checked
                                  if (option.id === 'other') {
                                    setIsOtherServices(checked === true);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormField
                    key="other"
                    control={form.control}
                    name="services"
                    render={({ field }) => {
                      return (
                        <FormItem
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("other")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "other"]
                                  : field.value?.filter(
                                      (value) => value !== "other"
                                    );
                                field.onChange(updatedValue);
                                setIsOtherServices(checked === true);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Other
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {isOtherServices && (
            <FormField
              control={form.control}
              name="otherServices"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Specify Other Services</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the other services provided"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="turnaroundTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turnaround Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2 weeks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceTenure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Tenure</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="biannual">Bi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Sale Details */}
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-4">Sale Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="installments">Installments</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="salesSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="reseller">Reseller</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="event">Event or Trade Show</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="saleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sale type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New Sale</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                      <SelectItem value="cross_sell">Cross-Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormField
              control={form.control}
              name="grossValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gross Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        $
                      </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cashIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash In</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        $
                      </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <p className="text-sm font-medium mb-2">Remaining</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  $
                </div>
                <Input
                  type="text"
                  value={remaining.toFixed(2)}
                  className="pl-7"
                  disabled
                />
              </div>
            </div>
          </div>
          
          {tax > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium flex justify-between">
                <span>Tax (3% for selected payment method):</span>
                <span>${tax.toFixed(2)}</span>
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Agreement (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload the signed agreement document (PDF, DOC, or DOCX)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit">
            Record Sale
          </Button>
        </div>
      </form>
    </Form>
  );
};
