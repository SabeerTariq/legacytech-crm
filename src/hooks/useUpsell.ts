import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UpsellFormData, ServiceSelection, Customer } from '@/types/upsell';

export const useUpsell = () => {
  const { toast } = useToast();
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
          assigned_by: (await supabase.auth.getUser()).data.user?.id || "",
          assigned_to: "",
          project_manager: "",
          gross_value: formData.grossValue,
          cash_in: formData.cashIn,
          remaining: formData.remaining,
          tax_deduction: 0,
          sale_date: formData.saleDate,
          service_tenure: "",
          turnaround_time: "",
          user_id: (await supabase.auth.getUser()).data.user?.id,
          is_upsell: true,
          original_sales_disposition_id: formData.originalSalesDispositionId,
          service_types: formData.serviceTypes
        })
        .select()
        .single();

      if (salesError) throw salesError;

      // Categorize services by type
      const projects = formData.selectedServices.filter(s => s.serviceType === 'project');
      const recurring = formData.selectedServices.filter(s => s.serviceType === 'recurring');
      const oneTime = formData.selectedServices.filter(s => s.serviceType === 'one-time');

      // Create projects for project-based services
      if (projects.length > 0) {
        const projectPromises = projects.map(async (service) => {
          const { error: projectError } = await supabase
            .from("projects")
            .insert({
              name: `${formData.customerName} - ${service.serviceName} (Upsell)`,
              client: formData.customerName,
              description: service.details,
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: "unassigned",
              user_id: (await supabase.auth.getUser()).data.user?.id,
              sales_disposition_id: salesData.id,
              project_type: "upsell",
              services: [service.serviceName],
              is_upsell: true
            });

          if (projectError) throw projectError;
        });

        await Promise.all(projectPromises);
      }

      // Create recurring service records
      if (recurring.length > 0) {
        const recurringPromises = recurring.map(async (service) => {
          const nextBillingDate = new Date();
          if (service.billingFrequency === 'monthly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          } else if (service.billingFrequency === 'yearly') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          }

          const { error: recurringError } = await supabase
            .from("recurring_services")
            .insert({
              customer_id: salesData.id,
              service_name: service.serviceName,
              service_type: service.category,
              billing_frequency: service.billingFrequency || 'monthly',
              amount: service.price,
              next_billing_date: nextBillingDate.toISOString().split('T')[0],
              status: 'active',
              auto_renew: true
            });

          if (recurringError) throw recurringError;
        });

        await Promise.all(recurringPromises);
      }

      // Create one-time service records
      if (oneTime.length > 0) {
        const oneTimePromises = oneTime.map(async (service) => {
          const { error: oneTimeError } = await supabase
            .from("one_time_services")
            .insert({
              customer_id: salesData.id,
              service_name: service.serviceName,
              service_type: service.category,
              amount: service.price,
              delivery_date: new Date().toISOString().split('T')[0],
              status: 'pending'
            });

          if (oneTimeError) throw oneTimeError;
        });

        await Promise.all(oneTimePromises);
      }

      return salesData;
    } catch (error) {
      console.error("Error creating upsell:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCustomersWithActiveProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_dispositions')
        .select('*')
        .order('sale_date', { ascending: false });

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

      const { data, error } = await supabase
        .from('sales_dispositions')
        .select('*')
        .eq('is_upsell', true)
        .gte('sale_date', getDateFromRange(timeRange))
        .order('sale_date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error loading upsell analytics:", error);
      throw error;
    }
  };

  return {
    loading,
    createUpsell,
    getCustomersWithActiveProjects,
    getUpsellAnalytics
  };
}; 