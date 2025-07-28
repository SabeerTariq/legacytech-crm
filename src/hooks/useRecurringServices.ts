import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type RecurringService = Database["public"]["Tables"]["recurring_services"]["Row"] & {
  customer: Database["public"]["Tables"]["sales_dispositions"]["Row"];
  tasks: Database["public"]["Tables"]["recurring_service_tasks"]["Row"][];
  billing_history: Database["public"]["Tables"]["billing_history"]["Row"][];
  renewal_notifications: Database["public"]["Tables"]["renewal_notifications"]["Row"][];
};

type CreateServiceData = {
  customer_id: string;
  service_name: string;
  description?: string;
  billing_cycle: "monthly" | "quarterly" | "semi_annual" | "annual";
  amount: number;
  start_date: string;
  payment_method?: string;
  assigned_team?: string;
  notes?: string;
  auto_renewal?: boolean;
};

type CreateTaskData = {
  recurring_service_id: string;
  task_title: string;
  task_description?: string;
  due_date: string;
  assigned_to_id?: string;
  priority?: "low" | "medium" | "high";
};

export const useRecurringServices = () => {
  const [services, setServices] = useState<RecurringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("recurring_services")
        .select(`
          *,
          customer:sales_dispositions(*),
          tasks:recurring_service_tasks(*),
          billing_history(*),
          renewal_notifications(*)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load services";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: CreateServiceData) => {
    try {
      const nextBillingDate = calculateNextBillingDate(serviceData.start_date, serviceData.billing_cycle);

      const { data, error: createError } = await supabase
        .from("recurring_services")
        .insert({
          ...serviceData,
          next_billing_date: nextBillingDate,
          status: "active",
          auto_renewal: serviceData.auto_renewal ?? true,
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Success",
        description: "Recurring service created successfully",
      });

      // Reload services to get the updated list
      await loadServices();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create service";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateService = async (serviceId: string, updates: Partial<Database["public"]["Tables"]["recurring_services"]["Update"]>) => {
    try {
      const { data, error: updateError } = await supabase
        .from("recurring_services")
        .update(updates)
        .eq("id", serviceId)
        .select()
        .single();

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Service updated successfully",
      });

      // Update the service in the local state
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, ...data } : service
      ));

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update service";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("recurring_services")
        .delete()
        .eq("id", serviceId);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });

      // Remove the service from local state
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete service";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    try {
      const { data, error: createError } = await supabase
        .from("recurring_service_tasks")
        .insert({
          ...taskData,
          status: "pending",
          priority: taskData.priority || "medium",
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Update the service in local state to include the new task
      setServices(prev => prev.map(service => 
        service.id === taskData.recurring_service_id 
          ? { ...service, tasks: [...service.tasks, data] }
          : service
      ));

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from("recurring_service_tasks")
        .update({ 
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null
        })
        .eq("id", taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update the task in local state
      setServices(prev => prev.map(service => ({
        ...service,
        tasks: service.tasks.map(task => 
          task.id === taskId ? { ...task, ...data } : task
        )
      })));

      toast({
        title: "Success",
        description: "Task status updated",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const generateBillingRecord = async (serviceId: string, billingDate: string, amount: number) => {
    try {
      const { data, error: createError } = await supabase
        .from("billing_history")
        .insert({
          recurring_service_id: serviceId,
          billing_date: billingDate,
          amount,
          status: "pending",
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update the service in local state to include the new billing record
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, billing_history: [...service.billing_history, data] }
          : service
      ));

      toast({
        title: "Success",
        description: "Billing record created",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create billing record";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const calculateNextBillingDate = (startDate: string, billingCycle: string): string => {
    const date = new Date(startDate);
    switch (billingCycle) {
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "semi_annual":
        date.setMonth(date.getMonth() + 6);
        break;
      case "annual":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const getServiceById = (serviceId: string): RecurringService | undefined => {
    return services.find(service => service.id === serviceId);
  };

  const getActiveServices = (): RecurringService[] => {
    return services.filter(service => service.status === "active");
  };

  const getUpcomingBillings = (days: number = 30): RecurringService[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return services.filter(service => {
      const billingDate = new Date(service.next_billing_date);
      return billingDate >= today && billingDate <= futureDate;
    });
  };

  const getTotalRevenue = (): number => {
    return services.reduce((total, service) => {
      const billingCount = service.billing_history.length;
      return total + (service.amount * billingCount);
    }, 0);
  };

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services,
    loading,
    error,
    loadServices,
    createService,
    updateService,
    deleteService,
    createTask,
    updateTaskStatus,
    generateBillingRecord,
    getServiceById,
    getActiveServices,
    getUpcomingBillings,
    getTotalRevenue,
  };
}; 