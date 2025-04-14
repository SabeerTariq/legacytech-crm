
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { toast } from 'sonner';
import { useCreateCustomer } from '@/hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().optional(),
  source: z.string().min(1, 'Please select a source'),
  status: z.enum(['active', 'lead', 'inactive']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewCustomerFormProps {
  onSuccess: () => void;
}

export const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const createCustomerMutation = useCreateCustomer();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      address: '',
      source: '',
      status: 'lead',
      notes: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Add current date
      const customerData = {
        ...data,
        joinDate: new Date().toISOString().split('T')[0],
        salesCount: 0,
        totalSpent: 0,
        createdBy: user?.id || 1, // Default to user ID 1 if not available
      };

      console.log('Submitting customer data:', customerData);

      // Call the API to create the customer
      await createCustomerMutation.mutateAsync(customerData);

      // Close the form on success
      onSuccess();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith Enterprises" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="123 Business St, City, State 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about this customer"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createCustomerMutation.isPending}>
            {createCustomerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Customer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
