import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextJWT';
import type { UpsellFormData, ServiceSelection, Customer } from '@/types/upsell';

export const useUpsell = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createUpsell = async (formData: UpsellFormData) => {
    setLoading(true);
    try {
      // Create sales disposition for upsell
      const { data: salesData, error: salesError } = await supabase
        .from("sales_dispositions")
        .insert({
          customer_name: formData.customerName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          business_name: formData.businessName,
          service_sold: formData.selectedServices[0]?.serviceName || "",
          services_included: formData.selectedServices.map(s => s.serviceName),
          service_details: formData.selectedServices.map(s => `${s.serviceName}: ${s.details}`).join("\n"),
          agreement_url: formData.agreementUrl,
          payment_mode: formData.paymentMode,
          company: "American Digital Agency",
          sales_source: "UPSELL",
          lead_source: "EXISTING_CUSTOMER",
          sale_type: "UPSELL",
          seller: "",
          account_manager: "",
          assigned_by: user?.id || "",
          assigned_to: "",
          project_manager: "",
          gross_value: formData.grossValue,
          cash_in: formData.cashIn,
          remaining: formData.remaining,
          tax_deduction: 0,
          sale_date: formData.saleDate,
          service_tenure: "",
          turnaround_time: "",
          user_id: user?.id || "",
          is_upsell: true,
          original_sales_disposition_id: formData.originalSalesDispositionId,
          service_types: formData.serviceTypes
        })
        .select()
        .single();

      if (salesError) throw salesError;

      // Create projects for project-based services
      const { projects, recurring, oneTime } = categorizeServices(formData.selectedServices);

      // Create projects for each project-based service
      for (const service of projects) {
        await supabase
          .from("projects")
          .insert({
            name: `${service.serviceName} - ${formData.customerName}`,
            client: formData.customerName,
            description: `Project created from upsell for service: ${service.serviceName}`,
            status: "new",
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            sales_disposition_id: salesData.id,
            budget: service.price || 0,
            services: [service.serviceName],
            user_id: user?.id || "",
            is_upsell: true
          });
      }

      // Create recurring services
      for (const service of recurring) {
        await supabase
          .from("recurring_services")
          .insert({
            customer_id: salesData.id,
            service_name: service.serviceName,
            service_type: service.serviceType || "hosting",
            billing_frequency: service.billingFrequency || "monthly",
            amount: service.price || 0,
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            status: "active",
            auto_renew: true
          });
      }

      // Create one-time services
      for (const service of oneTime) {
        await supabase
          .from("one_time_services")
          .insert({
            customer_id: salesData.id,
            service_name: service.serviceName,
            service_type: service.serviceType || "development",
            amount: service.price || 0,
            delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
            status: "pending"
          });
      }

      toast({
        title: "Upsell Created",
        description: `Successfully created upsell for ${formData.customerName}`,
      });

      return salesData;
    } catch (error) {
      console.error("Error creating upsell:", error);
      toast({
        title: "Error",
        description: "Failed to create upsell",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCustomersWithActiveProjects = async () => {
    try {
      let query = supabase
        .from('sales_dispositions')
        .select('*')
        .order('sale_date', { ascending: false });

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        console.log('Filtering customers for front_sales user in useUpsell:', user.id);
        query = query.eq('user_id', user.id);
      }
      // Filter by assigned upseller if they are an upseller
      else if (user?.employee?.department === 'Upseller') {
        console.log('Filtering customers for upseller in useUpsell:', user.employee.id);
        // Get customers from projects assigned to this upseller
        const { data: assignedProjects, error: projectsError } = await supabase
          .from('projects')
          .select('sales_disposition_id')
          .eq('assigned_pm_id', user.employee.id)
          .not('sales_disposition_id', 'is', null);

        if (projectsError) throw projectsError;

        if (assignedProjects && assignedProjects.length > 0) {
          const salesDispositionIds = assignedProjects
            .map(p => p.sales_disposition_id)
            .filter(id => id !== null);
          
          query = query.in('id', salesDispositionIds);
        } else {
          // No assigned projects, return empty array
          return [];
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Customer interface
      const customers: Customer[] = (data || []).map((sd: any) => ({
        id: sd.id,
        customer_name: sd.customer_name,
        email: sd.email,
        phone_number: sd.phone_number,
        business_name: sd.business_name,
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        total_recurring_services: 0,
        active_recurring_services: 0,
        monthly_recurring_revenue: 0,
        total_one_time_services: 0,
        total_sales: 1,
        total_lifetime_value: sd.gross_value || 0,
        last_purchase_date: sd.sale_date
      }));

      return customers;
    } catch (error) {
      console.error("Error loading customers:", error);
      throw error;
    }
  };

  const getUpsellAnalytics = async (timeRange: '7d' | '30d' | '90d' = '30d') => {
    try {
      const getDateFromRange = (range: '7d' | '30d' | '90d') => {
        const date = new Date();
        switch (range) {
          case '7d':
            date.setDate(date.getDate() - 7);
            break;
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
          case '90d':
            date.setDate(date.getDate() - 90);
            break;
        }
        return date.toISOString().split('T')[0];
      };

      let query = supabase
        .from('sales_dispositions')
        .select('*')
        .eq('is_upsell', true)
        .gte('sale_date', getDateFromRange(timeRange))
        .order('sale_date', { ascending: false });

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error loading upsell analytics:", error);
      throw error;
    }
  };

  // Helper function to categorize services
  const categorizeServices = (services: ServiceSelection[]) => {
    const projects = services.filter(s => s.serviceType === 'project');
    const recurring = services.filter(s => s.serviceType === 'recurring');
    const oneTime = services.filter(s => s.serviceType === 'one-time');
    
    return { projects, recurring, oneTime };
  };

  return {
    loading,
    createUpsell,
    getCustomersWithActiveProjects,
    getUpsellAnalytics
  };
}; 