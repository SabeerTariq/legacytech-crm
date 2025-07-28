// =====================================================
// UPSELL SYSTEM - TYPESCRIPT TYPES
// LogicWorks CRM - Mixed Service Types Support
// =====================================================

export type ServiceType = 'project' | 'recurring' | 'one-time';
export type BillingFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one-time';
export type ServiceCategory = 'hosting' | 'domain' | 'ssl' | 'development' | 'design' | 'marketing' | 'email' | 'consultation';

export interface Service {
  id: string;
  name: string;
  service_type: ServiceType;
  billing_frequency?: BillingFrequency;
  category: ServiceCategory;
  price: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceSelection {
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  billingFrequency?: BillingFrequency;
  category: ServiceCategory;
  customPrice: number;
  details: string;
  quantity?: number;
}

export interface RecurringService {
  id: string;
  customer_id: string;
  service_name: string;
  service_type: string;
  billing_frequency: BillingFrequency;
  amount: number;
  next_billing_date: string;
  status: 'active' | 'suspended' | 'cancelled';
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface OneTimeService {
  id: string;
  customer_id: string;
  service_name: string;
  service_type: string;
  amount: number;
  delivery_date?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  business_name?: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_recurring_services: number;
  active_recurring_services: number;
  monthly_recurring_revenue: number;
  total_one_time_services: number;
  total_sales: number;
  total_lifetime_value: number;
  last_purchase_date?: string;
}

export interface UpsellFormData {
  // Customer Info
  customerName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  
  // Service Selection
  selectedServices: ServiceSelection[];
  
  // Payment Info
  grossValue: number;
  cashIn: number;
  remaining: number;
  paymentMode: string;
  
  // Upsell Info
  isUpsell: boolean;
  originalSalesDispositionId?: string;
  serviceTypes: ServiceType[];
  
  // Additional Info
  saleDate: string;
  agreementUrl?: string;
  notes?: string;
}

export interface UpsellAnalytics {
  sales_disposition_id: string;
  customer_name: string;
  email: string;
  is_upsell: boolean;
  original_sales_disposition_id?: string;
  upsell_value: number;
  sale_date: string;
  service_types: ServiceType[];
  project_count: number;
  recurring_service_count: number;
  one_time_service_count: number;
}

export interface CustomerServicePortfolio {
  customer_id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_recurring_services: number;
  active_recurring_services: number;
  monthly_recurring_revenue: number;
  total_one_time_services: number;
  total_sales: number;
  total_lifetime_value: number;
  last_purchase_date?: string;
}

export interface UpsellSummary {
  totalUpsells: number;
  totalUpsellRevenue: number;
  averageUpsellValue: number;
  conversionRate: number;
  topUpsellServices: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  upsellTrends: Array<{
    month: string;
    upsells: number;
    revenue: number;
  }>;
} 