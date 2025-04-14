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
import { useCreateLead } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface NewLeadFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  businessName: z.string().optional(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().optional(),
  source: z.string({
    required_error: 'Please select a lead source.',
  }),
  status: z.string().default('new'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onSuccess }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      source: '',
      status: 'new',
      notes: '',
    },
  });

  const { user } = useAuth();
  const createLeadMutation = useCreateLead();

  const onSubmit = async (data: FormValues) => {
    try {
      // Add current date and assign to current user
      const leadData = {
        ...data,
        createdDate: new Date().toISOString(),
        assignedTo: user?.id || 1, // Default to user ID 1 if not available
        status: 'new', // Default status for new leads
      };

      console.log('Submitting lead data:', leadData);

      // Call the API to create the lead
      const result = await createLeadMutation.mutateAsync(leadData);
      console.log('Lead creation result:', result);

      // Close the form on success
      onSuccess();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
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
                  <Input placeholder="Acme Inc." {...field} />
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
                  <Input placeholder="john@example.com" {...field} />
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about this lead"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createLeadMutation.isPending}>
            {createLeadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Lead'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
