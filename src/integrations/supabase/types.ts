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
      inventory_documents: {
        Row: {
          date: string
          description: string | null
          file_name: string | null
          file_path: string | null
          file_size: string | null
          id: string
          title: string
          type: string
        }
        Insert: {
          date?: string
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: string | null
          id?: string
          title: string
          type: string
        }
        Update: {
          date?: string
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: string | null
          id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          description: string
          product_number: string
          quantity: number
        }
        Insert: {
          description: string
          product_number: string
          quantity?: number
        }
        Update: {
          description?: string
          product_number?: string
          quantity?: number
        }
        Relationships: []
      }
      mto_orders: {
        Row: {
          casing_grade: string | null
          completed: boolean | null
          cross_dock_form_link: string | null
          destination_manager_email: string | null
          email_message: string | null
          have_casings: boolean | null
          id: string
          invoice_number: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          product_number: string | null
          projected_delivery: string | null
          quantity: number | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          store: string | null
          timestamp: string | null
          tire_size: string | null
          tread: string | null
          tread_in_inventory: boolean | null
        }
        Insert: {
          casing_grade?: string | null
          completed?: boolean | null
          cross_dock_form_link?: string | null
          destination_manager_email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          store?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_in_inventory?: boolean | null
        }
        Update: {
          casing_grade?: string | null
          completed?: boolean | null
          cross_dock_form_link?: string | null
          destination_manager_email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          store?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_in_inventory?: boolean | null
        }
        Relationships: []
      }
      order_history: {
        Row: {
          archived_at: string | null
          id: string
          original_data: Json | null
          source_table: string | null
        }
        Insert: {
          archived_at?: string | null
          id?: string
          original_data?: Json | null
          source_table?: string | null
        }
        Update: {
          archived_at?: string | null
          id?: string
          original_data?: Json | null
          source_table?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed: boolean | null
          "cross_dock_ eta_date": string | null
          cross_dock_destination: string | null
          cross_dock_form_link: string | null
          cross_dock_receiver_number: string | null
          cross_dock_type: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          invoice_number: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          out_of_stock: boolean | null
          product_number: string | null
          pull_sheet_link: string | null
          quantity: number | null
          schedule_arrival: string | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          store: string | null
          timestamp: string
        }
        Insert: {
          completed?: boolean | null
          "cross_dock_ eta_date"?: string | null
          cross_dock_destination?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          store?: string | null
          timestamp: string
        }
        Update: {
          completed?: boolean | null
          "cross_dock_ eta_date"?: string | null
          cross_dock_destination?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          store?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      wheel_orders: {
        Row: {
          completed: boolean | null
          cross_dock_form_link: string | null
          desired_color: string | null
          destination_manager_email: string | null
          email_message: string | null
          hand_holes: number | null
          id: string
          name: string | null
          order_type: string | null
          quantity: number | null
          send_email_trigger: boolean | null
          store: string | null
          timestamp: string | null
          wheel_material: string | null
          wheel_size: string | null
          wheel_type: string | null
          work_order_link: string | null
        }
        Insert: {
          completed?: boolean | null
          cross_dock_form_link?: string | null
          desired_color?: string | null
          destination_manager_email?: string | null
          email_message?: string | null
          hand_holes?: number | null
          id?: string
          name?: string | null
          order_type?: string | null
          quantity?: number | null
          send_email_trigger?: boolean | null
          store?: string | null
          timestamp?: string | null
          wheel_material?: string | null
          wheel_size?: string | null
          wheel_type?: string | null
          work_order_link?: string | null
        }
        Update: {
          completed?: boolean | null
          cross_dock_form_link?: string | null
          desired_color?: string | null
          destination_manager_email?: string | null
          email_message?: string | null
          hand_holes?: number | null
          id?: string
          name?: string | null
          order_type?: string | null
          quantity?: number | null
          send_email_trigger?: boolean | null
          store?: string | null
          timestamp?: string | null
          wheel_material?: string | null
          wheel_size?: string | null
          wheel_type?: string | null
          work_order_link?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_order_by_invoice: {
        Args: { p_invoice: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
