export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      sales_dispositions: {
        Row: {
          id: string
          sale_date: string
          customer_name: string
          phone_number: string
          email: string
          front_brand: string | null
          business_name: string | null
          service_sold: string
          services_included: string[]
          service_details: string | null
          agreement_url: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_source: string | null
          payment_company: string | null
          brand: string | null
          agreement_signed: boolean | null
          agreement_sent: boolean | null
          company: Database["public"]["Enums"]["company"]
          sales_source: Database["public"]["Enums"]["sales_source"]
          lead_source: Database["public"]["Enums"]["lead_source"]
          sale_type: Database["public"]["Enums"]["sale_type"]
          gross_value: number
          cash_in: number
          remaining: number
          tax_deduction: number | null
          seller: string
          account_manager: string
          project_manager: string
          assigned_to: string
          assigned_by: string
          created_at: string
          updated_at: string
          user_id: string
          lead_id: string | null
          is_upsell: boolean | null
          original_sales_disposition_id: string | null
          service_tenure: string
          turnaround_time: string
          service_types: string[] | null
        }
        Insert: {
          id?: string
          sale_date: string
          customer_name: string
          phone_number: string
          email: string
          front_brand?: string | null
          business_name?: string | null
          service_sold: string
          services_included: string[]
          service_details?: string | null
          agreement_url?: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_source?: string | null
          payment_company?: string | null
          brand?: string | null
          agreement_signed?: boolean | null
          agreement_sent?: boolean | null
          company: Database["public"]["Enums"]["company"]
          sales_source: Database["public"]["Enums"]["sales_source"]
          lead_source: Database["public"]["Enums"]["lead_source"]
          sale_type: Database["public"]["Enums"]["sale_type"]
          gross_value: number
          cash_in: number
          remaining: number
          tax_deduction?: number | null
          seller: string
          account_manager: string
          project_manager: string
          assigned_to: string
          assigned_by: string
          created_at?: string
          updated_at?: string
          user_id: string
          lead_id?: string | null
          is_upsell?: boolean | null
          original_sales_disposition_id?: string | null
          service_tenure: string
          turnaround_time: string
          service_types?: string[] | null
        }
        Update: {
          id?: string
          sale_date?: string
          customer_name?: string
          phone_number?: string
          email?: string
          front_brand?: string | null
          business_name?: string | null
          service_sold?: string
          services_included?: string[]
          service_details?: string | null
          agreement_url?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_source?: string | null
          payment_company?: string | null
          brand?: string | null
          agreement_signed?: boolean | null
          agreement_sent?: boolean | null
          company?: Database["public"]["Enums"]["company"]
          sales_source?: Database["public"]["Enums"]["sales_source"]
          lead_source?: Database["public"]["Enums"]["lead_source"]
          sale_type?: Database["public"]["Enums"]["sale_type"]
          gross_value?: number
          cash_in?: number
          remaining?: number
          tax_deduction?: number | null
          seller?: string
          account_manager?: string
          project_manager?: string
          assigned_to?: string
          assigned_by?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          lead_id?: string | null
          is_upsell?: boolean | null
          original_sales_disposition_id?: string | null
          service_tenure?: string
          turnaround_time?: string
          service_types?: string[] | null
        }
      }
      services: {
        Row: {
          id: string
          name: string
          created_at: string
          service_type: string | null
          billing_frequency: string | null
          category: string | null
          price: number | null
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          service_type?: string | null
          billing_frequency?: string | null
          category?: string | null
          price?: number | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          service_type?: string | null
          billing_frequency?: string | null
          category?: string | null
          price?: number | null
          description?: string | null
        }
      }
      // Add other tables as needed...
    }
    Enums: {
      payment_mode:
        | "WIRE"
        | "PayPal OSCS"
        | "Authorize.net OSCS"
        | "Authorize.net ADA"
        | "SWIPE SIMPLE ADA"
        | "SQUARE SKYLINE"
        | "PAY BRIGHT AZ TECH"
        | "ZELLE ADA"
        | "ZELLE AZ TECH"
        | "ZELLE AZ SKYLINE"
        | "CASH APP ADA"
      company: "American Digital Agency" | "Skyline" | "AZ TECH" | "OSCS"
      sales_source: "BARK" | "FACEBOOK" | "LINKDIN" | "PPC" | "REFFERAL"
      lead_source: "PAID_MARKETING" | "ORGANIC" | "SCRAPPED"
      sale_type:
        | "FRONT"
        | "UPSELL"
        | "FRONT_REMAINING"
        | "UPSELL_REMAINING"
        | "RENEWAL"
        | "AD_SPENT"
    }
  }
}
