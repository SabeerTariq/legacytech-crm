import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Upload, DollarSign, Users, Target, TrendingUp } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const serviceTenureOptions = Array.from({ length: 120 }, (_, i) => {
  const months = i + 1;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  return {
    value: `${months}`,
    label: years > 0 
      ? `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
      : `${months} month${months > 1 ? 's' : ''}`
  };
});

const formSchema = z.object({
  sale_date: z.date({
    required_error: "Sale date is required",
  }),
  customer_name: z.string().min(1, "Customer name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  front_brand: z.string().optional(),
  business_name: z.string().optional(),
  service_sold: z.string().min(1, "Service sold is required"),
  services_included: z.array(z.string()).min(1, "Select at least one service"),
  turnaround_time: z.string().min(1, "Turn around time is required"),
  service_tenure: z.string().min(1, "Service tenure is required"),
  service_details: z.string().optional(),
  payment_mode: z.enum([
    "WIRE",
    "PayPal OSCS",
    "Authorize.net OSCS",
    "Authorize.net ADA",
    "SWIPE SIMPLE ADA",
    "SQUARE SKYLINE",
    "PAY BRIGHT AZ TECH",
    "ZELLE ADA",
    "ZELLE AZ TECH",
    "ZELLE AZ SKYLINE",
    "CASH APP ADA"
  ], {
    required_error: "Payment mode is required",
  }),
  company: z.enum([
    "American Digital Agency",
    "Skyline",
    "AZ TECH",
    "OSCS"
  ], {
    required_error: "Company is required",
  }),
  sales_source: z.enum([
    "BARK",
    "FACEBOOK",
    "LINKDIN",
    "PPC",
    "REFFERAL"
  ], {
    required_error: "Sales source is required",
  }),
  lead_source: z.enum([
    "PAID_MARKETING",
    "ORGANIC",
    "SCRAPPED"
  ], {
    required_error: "Lead source is required",
  }),
  sale_type: z.enum([
    "FRONT",
    "UPSELL",
    "FRONT_REMAINING",
    "UPSELL_REMAINING",
    "RENEWAL",
    "AD_SPENT"
  ], {
    required_error: "Sale type is required",
  }),
  gross_value: z.string().min(1, "Gross value is required"),
  cash_in: z.string().min(1, "Cash in value is required"),
  remaining: z.string().min(1, "Remaining value is required"),
  seller: z.string().min(1, "Seller is required"),
  account_manager: z.string().min(1, "Account manager is required"),
  project_manager: z.string().min(1, "Project manager is required"),
  assigned_to: z.string().min(1, "Assigned to is required"),
  assigned_by: z.string().min(1, "Assigned by is required"),
  agreement: z.custom<File>()
    .refine((file) => file instanceof File, "Agreement file is required")
    .refine((file) => file?.size <= 5000000, "Max file size is 5MB"),
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedDispositionFormProps {
  onSubmit: (data: any) => void;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  performance?: {
    salesTarget?: number;
    salesAchieved?: number;
    total_tasks_assigned?: number;
    tasks_completed_ontime?: number;
  };
}

const EnhancedDispositionForm: React.FC<EnhancedDispositionFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [services, setServices] = React.useState<{ value: string; label: string; }[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services_included: [],
      assigned_by: user?.user_metadata?.name || "Current User",
    }
  });

  // Fetch services
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('name')
          .order('name');
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch services. Please try again.",
          });
          return;
        }
        
        if (data && Array.isArray(data)) {
          const sortedServiceOptions = data.map(service => ({
            value: service.name,
            label: service.name
          }));
          setServices(sortedServiceOptions);
        }
      } catch (error) {
        setServices([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch services. Please try again.",
        });
      }
    };

    fetchServices();
  }, [toast]);

  // Fetch Business Development employees (sellers)
  const { data: businessDevEmployees = [] } = useQuery({
    queryKey: ['business-dev-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Business Development');
      
      if (error) {
        toast({
          title: "Error fetching employees",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        role: emp.role,
        performance: {
          salesTarget: Number(emp.performance?.salesTarget || emp.performance?.sales_target || 0),
          salesAchieved: Number(emp.performance?.salesAchieved || emp.performance?.sales_achieved || 0),
        }
      })) as Employee[];
    },
    enabled: !!user,
  });

  // Fetch Project Management employees
  const { data: projectManagers = [] } = useQuery({
    queryKey: ['project-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Project Management');
      
      if (error) {
        toast({
          title: "Error fetching project managers",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        role: emp.role,
        performance: {
          total_tasks_assigned: Number(emp.performance?.total_tasks_assigned || 0),
          tasks_completed_ontime: Number(emp.performance?.tasks_completed_ontime || 0),
        }
      })) as Employee[];
    },
    enabled: !!user,
  });

  // Watch form values for real-time calculations
  const watchedValues = form.watch();
  const cashInValue = parseFloat(watchedValues.cash_in) || 0;
  const selectedSeller = watchedValues.seller;
  const selectedProjectManager = watchedValues.project_manager;

  // Calculate seller performance
  const sellerPerformance = React.useMemo(() => {
    const seller = businessDevEmployees.find(emp => emp.name === selectedSeller);
    if (!seller) return null;

    const currentSales = seller.performance?.salesAchieved || 0;
    const target = seller.performance?.salesTarget || 0;
    const newTotal = currentSales + cashInValue;
    const achievementRate = target > 0 ? (newTotal / target) * 100 : 0;

    return {
      name: seller.name,
      currentSales,
      target,
      newTotal,
      achievementRate,
      increase: cashInValue
    };
  }, [selectedSeller, cashInValue, businessDevEmployees]);

  // Calculate project manager workload
  const projectManagerWorkload = React.useMemo(() => {
    const pm = projectManagers.find(emp => emp.name === selectedProjectManager);
    if (!pm) return null;

    const currentTasks = pm.performance?.total_tasks_assigned || 0;
    const completedTasks = pm.performance?.tasks_completed_ontime || 0;
    const completionRate = currentTasks > 0 ? (completedTasks / currentTasks) * 100 : 0;

    return {
      name: pm.name,
      currentTasks,
      completedTasks,
      completionRate
    };
  }, [selectedProjectManager, projectManagers]);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      
      // Upload agreement file
      const fileExt = data.agreement.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('agreements')
        .upload(filePath, data.agreement);
        
      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('agreements')
        .getPublicUrl(filePath);

      // Prepare form data for submission
      const formData = {
        ...data,
        agreement_url: publicUrl,
        gross_value: parseFloat(data.gross_value),
        cash_in: parseFloat(data.cash_in),
        remaining: parseFloat(data.remaining),
      };

      delete formData.agreement;
      
      // Create sales disposition
      const { data: salesData, error: salesError } = await supabase
        .from('sales_dispositions')
        .insert([formData])
        .select()
        .single();

      if (salesError) throw salesError;

      // Create project from sales disposition
      const projectData = {
        name: `${data.customer_name} - ${data.service_sold}`,
        client: data.customer_name,
        description: `Project created from sales disposition. Services: ${data.services_included.join(', ')}. ${data.service_details || ''}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'new',
        progress: 0,
        sales_disposition_id: salesData.id,
        project_manager: data.project_manager,
        assigned_to: data.assigned_to,
        user_id: user?.id
      };

      const { data: projectDataResult, error: projectError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (projectError) throw projectError;

      // Update seller performance
      if (sellerPerformance) {
        const seller = businessDevEmployees.find(emp => emp.name === data.seller);
        if (seller) {
          const currentPerformance = seller.performance || {};
          const newSalesAchieved = (currentPerformance.salesAchieved || 0) + cashInValue;
          
          await supabase
            .from('employees')
            .update({
              performance: {
                ...currentPerformance,
                salesAchieved: newSalesAchieved
              }
            })
            .eq('id', seller.id);
        }
      }

      // Update project manager workload
      if (projectManagerWorkload) {
        const pm = projectManagers.find(emp => emp.name === data.project_manager);
        if (pm) {
          const currentPerformance = pm.performance || {};
          const newTotalTasks = (currentPerformance.total_tasks_assigned || 0) + 1;
          
          await supabase
            .from('employees')
            .update({
              performance: {
                ...currentPerformance,
                total_tasks_assigned: newTotalTasks
              }
            })
            .eq('id', pm.id);
        }
      }

      onSubmit({
        salesDisposition: salesData,
        project: projectDataResult
      });
      
      toast({
        title: "Success",
        description: "Sales disposition and project created successfully!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics Preview */}
      {(sellerPerformance || projectManagerWorkload) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Impact Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sellerPerformance && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{sellerPerformance.name} (Seller)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Sales</p>
                    <p className="text-lg font-bold">${sellerPerformance.currentSales.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-lg font-bold">${sellerPerformance.target.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Total</p>
                    <p className="text-lg font-bold text-green-600">${sellerPerformance.newTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement</p>
                    <p className="text-lg font-bold">{sellerPerformance.achievementRate.toFixed(1)}%</p>
                    <Progress value={sellerPerformance.achievementRate} className="h-2" />
                  </div>
                </div>
              </div>
            )}

            {projectManagerWorkload && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{projectManagerWorkload.name} (Project Manager)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Tasks</p>
                    <p className="text-lg font-bold">{projectManagerWorkload.currentTasks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-lg font-bold">{projectManagerWorkload.completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-bold">{projectManagerWorkload.completionRate.toFixed(1)}%</p>
                    <Progress value={projectManagerWorkload.completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Disposition Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Sale Date */}
              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sale Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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

              {/* Customer Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="front_brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Front Brand</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Service Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="service_sold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Sold</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="services_included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services Included</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={services || []}
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Select services..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="turnaround_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turn Around Time</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="service_tenure"
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
                            {serviceTenureOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="service_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service/Sale Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter service or sale details..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Financial Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gross_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Value</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cash_in"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cash In</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remaining</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seller"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller (Business Development)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seller" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessDevEmployees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.name}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Manager</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectManagers.map((pm) => (
                              <SelectItem key={pm.id} value={pm.name}>
                                {pm.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Manager</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigned_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned By</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Company and Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company and Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_mode"
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
                            <SelectItem value="WIRE">WIRE</SelectItem>
                            <SelectItem value="PayPal OSCS">PayPal OSCS</SelectItem>
                            <SelectItem value="Authorize.net OSCS">Authorize.net OSCS</SelectItem>
                            <SelectItem value="Authorize.net ADA">Authorize.net ADA</SelectItem>
                            <SelectItem value="SWIPE SIMPLE ADA">SWIPE SIMPLE ADA</SelectItem>
                            <SelectItem value="SQUARE SKYLINE">SQUARE SKYLINE</SelectItem>
                            <SelectItem value="PAY BRIGHT AZ TECH">PAY BRIGHT AZ TECH</SelectItem>
                            <SelectItem value="ZELLE ADA">ZELLE ADA</SelectItem>
                            <SelectItem value="ZELLE AZ TECH">ZELLE AZ TECH</SelectItem>
                            <SelectItem value="ZELLE AZ SKYLINE">ZELLE AZ SKYLINE</SelectItem>
                            <SelectItem value="CASH APP ADA">CASH APP ADA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="American Digital Agency">American Digital Agency</SelectItem>
                            <SelectItem value="Skyline">Skyline</SelectItem>
                            <SelectItem value="AZ TECH">AZ TECH</SelectItem>
                            <SelectItem value="OSCS">OSCS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Source Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Source Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="sales_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BARK">BARK</SelectItem>
                            <SelectItem value="FACEBOOK">FACEBOOK</SelectItem>
                            <SelectItem value="LINKDIN">LINKEDIN</SelectItem>
                            <SelectItem value="PPC">PPC</SelectItem>
                            <SelectItem value="REFFERAL">REFERRAL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lead_source"
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
                            <SelectItem value="PAID_MARKETING">PAID MARKETING</SelectItem>
                            <SelectItem value="ORGANIC">ORGANIC</SelectItem>
                            <SelectItem value="SCRAPPED">SCRAPPED</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sale_type"
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
                            <SelectItem value="FRONT">FRONT</SelectItem>
                            <SelectItem value="UPSELL">UPSELL</SelectItem>
                            <SelectItem value="FRONT_REMAINING">FRONT REMAINING</SelectItem>
                            <SelectItem value="UPSELL_REMAINING">UPSELL REMAINING</SelectItem>
                            <SelectItem value="RENEWAL">RENEWAL</SelectItem>
                            <SelectItem value="AD_SPENT">AD SPENT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Agreement Upload */}
              <FormField
                control={form.control}
                name="agreement"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload Agreement</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload agreement document (PDF, DOC, or DOCX)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading} className="flex items-center gap-2">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Sale & Project...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Create Sale & Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDispositionForm; 