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
      orders: {
        Row: {
          id: number
          order_number: string
          store: string
          plant: string
          normalized_store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          role: string | null
          order_type: string
          status: string
          tire_size: string | null
          quantity: number | null
          description: string | null
          invoice_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number?: string
          store: string
          plant: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          role?: string | null
          order_type: string
          status?: string
          tire_size?: string | null
          quantity?: number | null
          description?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          store?: string
          plant?: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          role?: string | null
          order_type?: string
          status?: string
          tire_size?: string | null
          quantity?: number | null
          description?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mto_orders: {
        Row: {
          id: number
          mto_number: string
          order_number: string | null
          product_number: string
          store: string
          plant: string
          normalized_store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          role: string | null
          status: string
          quantity: number
          tire_size: string | null
          casing_grade: string | null
          tread: string | null
          notes: string | null
          idempotency_key: string | null
          invoice_number: string | null
          promised_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          mto_number?: string
          order_number?: string | null
          product_number?: string
          store: string
          plant: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          role?: string | null
          status?: string
          quantity?: number
          tire_size?: string | null
          casing_grade?: string | null
          tread?: string | null
          notes?: string | null
          idempotency_key?: string | null
          invoice_number?: string | null
          promised_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          mto_number?: string
          order_number?: string | null
          product_number?: string
          store?: string
          plant?: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          role?: string | null
          status?: string
          quantity?: number
          tire_size?: string | null
          casing_grade?: string | null
          tread?: string | null
          notes?: string | null
          idempotency_key?: string | null
          invoice_number?: string | null
          promised_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      wheel_orders: {
        Row: {
          id: number
          wheel_number: string
          store: string
          plant: string
          normalized_store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          status: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          wheel_number?: string
          store: string
          plant: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          status?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          wheel_number?: string
          store?: string
          plant?: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          status?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      warranty_orders: {
        Row: {
          id: number
          warranty_number: string
          store: string
          plant: string
          normalized_store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          warranty_number?: string
          store: string
          plant: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          warranty_number?: string
          store?: string
          plant?: string
          normalized_store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_users: {
        Row: {
          id: number
          email: string
          full_name: string | null
          role: string
          status: string
          store: string | null
          plant: string | null
          normalized_store: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          full_name?: string | null
          role: string
          status?: string
          store?: string | null
          plant?: string | null
          normalized_store?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          full_name?: string | null
          role?: string
          status?: string
          store?: string | null
          plant?: string | null
          normalized_store?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          id: number
          store_number: string
          store_name: string | null
          submitted_by: string
          submitted_by_email: string | null
          status: string
          priority: string | null
          description: string
          resolution_notes: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: number
          store_number: string
          store_name?: string | null
          submitted_by: string
          submitted_by_email?: string | null
          status?: string
          priority?: string | null
          description: string
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: number
          store_number?: string
          store_name?: string | null
          submitted_by?: string
          submitted_by_email?: string | null
          status?: string
          priority?: string | null
          description?: string
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      approved_treads: {
        Row: {
          id: number
          tread_code: string
          status: string
          notes: string | null
          category: string | null
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tread_code: string
          status?: string
          notes?: string | null
          category?: string | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tread_code?: string
          status?: string
          notes?: string | null
          category?: string | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          id: number
          action: string
          affected_user: string
          performed_by: string
          platform: string
          description: string | null
          metadata: Json | null
          timestamp: string
        }
        Insert: {
          id?: number
          action: string
          affected_user: string
          performed_by: string
          platform: string
          description?: string | null
          metadata?: Json | null
          timestamp?: string
        }
        Update: {
          id?: number
          action?: string
          affected_user?: string
          performed_by?: string
          platform?: string
          description?: string | null
          metadata?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          id: number
          name: string
          email: string
          role: string
          store_number: string | null
          plant_code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          role: string
          store_number?: string | null
          plant_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          role?: string
          store_number?: string | null
          plant_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          current_plant: string
          last_plant_switch: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          current_plant: string
          last_plant_switch?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          current_plant?: string
          last_plant_switch?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      plant_switch_logs: {
        Row: {
          id: number
          user_id: string
          from_plant: string | null
          to_plant: string
          switched_at: string
        }
        Insert: {
          id?: number
          user_id: string
          from_plant?: string | null
          to_plant: string
          switched_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          from_plant?: string | null
          to_plant?: string
          switched_at?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          id: number
          order_id: number
          message: string
          sender_type: string
          sender_name: string | null
          store: string | null
          created_at: string
          read_at: string | null
          email_sent: boolean
          attachments: Json | null
        }
        Insert: {
          id?: number
          order_id: number
          message: string
          sender_type: string
          sender_name?: string | null
          store?: string | null
          created_at?: string
          read_at?: string | null
          email_sent?: boolean
          attachments?: Json | null
        }
        Update: {
          id?: number
          order_id?: number
          message?: string
          sender_type?: string
          sender_name?: string | null
          store?: string | null
          created_at?: string
          read_at?: string | null
          email_sent?: boolean
          attachments?: Json | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          id: number
          message_id: number
          file_name: string
          file_url: string
          file_size: number | null
          file_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: number
          message_id: number
          file_name: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: number
          message_id?: number
          file_name?: string
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      message_read_status: {
        Row: {
          id: number
          message_id: number
          user_email: string
          read_at: string
        }
        Insert: {
          id?: number
          message_id: number
          user_email: string
          read_at?: string
        }
        Update: {
          id?: number
          message_id?: number
          user_email?: string
          read_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          id: number
          template_name: string
          template_content: string
          category: string | null
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          template_name: string
          template_content: string
          category?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          template_name?: string
          template_content?: string
          category?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ordering_email_logs: {
        Row: {
          id: number
          order_id: string
          order_type: string
          recipients: string[]
          email_provider: string
          status: string
          notification_type: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: string
          order_type: string
          recipients: string[]
          email_provider?: string
          status: string
          notification_type: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: string
          order_type?: string
          recipients?: string[]
          email_provider?: string
          status?: string
          notification_type?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      store_email_recipients: {
        Row: {
          id: number
          store_number: string
          recipient_email: string
          recipient_role: string | null
          order_types: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          store_number: string
          recipient_email: string
          recipient_role?: string | null
          order_types?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          store_number?: string
          recipient_email?: string
          recipient_role?: string | null
          order_types?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_registrations: {
        Row: {
          id: number
          email: string
          full_name: string | null
          role: string | null
          store: string | null
          plant: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          full_name?: string | null
          role?: string | null
          store?: string | null
          plant?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          full_name?: string | null
          role?: string | null
          store?: string | null
          plant?: string | null
          status?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}
