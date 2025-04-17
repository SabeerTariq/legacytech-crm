export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_group: boolean
          last_message_text: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_text?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_text?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string
          email: string
          id: string
          join_date: string
          name: string
          performance: Json
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          id?: string
          join_date: string
          name: string
          performance?: Json
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          id?: string
          join_date?: string
          name?: string
          performance?: Json
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          additional_info: string | null
          agent: string | null
          assigned_to_id: string | null
          budget: string | null
          business_description: string | null
          city_state: string | null
          client_name: string
          contact_number: string | null
          created_at: string | null
          date: string | null
          email_address: string
          id: string
          services_required: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          additional_info?: string | null
          agent?: string | null
          assigned_to_id?: string | null
          budget?: string | null
          business_description?: string | null
          city_state?: string | null
          client_name: string
          contact_number?: string | null
          created_at?: string | null
          date?: string | null
          email_address: string
          id?: string
          services_required?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          additional_info?: string | null
          agent?: string | null
          assigned_to_id?: string | null
          budget?: string | null
          business_description?: string | null
          city_state?: string | null
          client_name?: string
          contact_number?: string | null
          created_at?: string | null
          date?: string | null
          email_address?: string
          id?: string
          services_required?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assigned_to_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          name: string
          progress: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          name: string
          progress?: number | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          progress?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_dispositions: {
        Row: {
          account_manager: string
          agreement_url: string | null
          assigned_by: string
          assigned_to: string
          business_name: string | null
          cash_in: number
          company: Database["public"]["Enums"]["company"]
          created_at: string
          customer_name: string
          email: string
          front_brand: string | null
          gross_value: number
          id: string
          lead_source: Database["public"]["Enums"]["lead_source"]
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          phone_number: string
          project_manager: string
          remaining: number
          sale_date: string
          sale_type: Database["public"]["Enums"]["sale_type"]
          sales_source: Database["public"]["Enums"]["sales_source"]
          seller: string
          service_details: string | null
          service_sold: string
          service_tenure: string
          services_included: string[]
          tax_deduction: number | null
          turnaround_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_manager: string
          agreement_url?: string | null
          assigned_by: string
          assigned_to: string
          business_name?: string | null
          cash_in: number
          company: Database["public"]["Enums"]["company"]
          created_at?: string
          customer_name: string
          email: string
          front_brand?: string | null
          gross_value: number
          id?: string
          lead_source: Database["public"]["Enums"]["lead_source"]
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          phone_number: string
          project_manager: string
          remaining: number
          sale_date: string
          sale_type: Database["public"]["Enums"]["sale_type"]
          sales_source: Database["public"]["Enums"]["sales_source"]
          seller: string
          service_details?: string | null
          service_sold: string
          service_tenure: string
          services_included: string[]
          tax_deduction?: number | null
          turnaround_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_manager?: string
          agreement_url?: string | null
          assigned_by?: string
          assigned_to?: string
          business_name?: string | null
          cash_in?: number
          company?: Database["public"]["Enums"]["company"]
          created_at?: string
          customer_name?: string
          email?: string
          front_brand?: string | null
          gross_value?: number
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"]
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          phone_number?: string
          project_manager?: string
          remaining?: number
          sale_date?: string
          sale_type?: Database["public"]["Enums"]["sale_type"]
          sales_source?: Database["public"]["Enums"]["sales_source"]
          seller?: string
          service_details?: string | null
          service_sold?: string
          service_tenure?: string
          services_included?: string[]
          tax_deduction?: number | null
          turnaround_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      company: "American Digital Agency" | "Skyline" | "AZ TECH" | "OSCS"
      lead_source: "PAID_MARKETING" | "ORGANIC" | "SCRAPPED"
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
      sale_type:
        | "FRONT"
        | "UPSELL"
        | "FRONT_REMAINING"
        | "UPSELL_REMAINING"
        | "RENEWAL"
        | "AD_SPENT"
      sales_source: "BARK" | "FACEBOOK" | "LINKDIN" | "PPC" | "REFFERAL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company: ["American Digital Agency", "Skyline", "AZ TECH", "OSCS"],
      lead_source: ["PAID_MARKETING", "ORGANIC", "SCRAPPED"],
      payment_mode: [
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
        "CASH APP ADA",
      ],
      sale_type: [
        "FRONT",
        "UPSELL",
        "FRONT_REMAINING",
        "UPSELL_REMAINING",
        "RENEWAL",
        "AD_SPENT",
      ],
      sales_source: ["BARK", "FACEBOOK", "LINKDIN", "PPC", "REFFERAL"],
    },
  },
} as const
