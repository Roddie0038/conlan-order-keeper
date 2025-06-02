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
      approved_treads: {
        Row: {
          category: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          notes: string | null
          status: string | null
          tread_code: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          status?: string | null
          tread_code: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          status?: string | null
          tread_code?: string
          updated_at?: string
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
          completed_at: string | null
          cross_dock_form_link: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          have_casings: boolean | null
          id: string
          in_transit_at: string | null
          invoice_number: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          plant: string | null
          product_number: string | null
          projected_delivery: string | null
          quantity: number | null
          ready_to_ship_at: string | null
          received_at: string | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          status: string | null
          status_updated_at: string | null
          store: string | null
          timestamp: string | null
          tire_size: string | null
          tread: string | null
          tread_in_inventory: boolean | null
          type: string | null
        }
        Insert: {
          casing_grade?: string | null
          completed?: boolean | null
          completed_at?: string | null
          cross_dock_form_link?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          in_transit_at?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          plant?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_in_inventory?: boolean | null
          type?: string | null
        }
        Update: {
          casing_grade?: string | null
          completed?: boolean | null
          completed_at?: string | null
          cross_dock_form_link?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          in_transit_at?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          plant?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_in_inventory?: boolean | null
          type?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          archived: boolean | null
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          cross_dock_destination: string | null
          cross_dock_eta_date: string | null
          cross_dock_form_link: string | null
          cross_dock_receiver_number: string | null
          cross_dock_type: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          id: number
          in_transit_at: string | null
          invoice_number: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          out_of_stock: boolean | null
          plant: string | null
          product_number: string | null
          pull_sheet_link: string | null
          quantity: number | null
          ready_to_ship_at: string | null
          received_at: string | null
          reopened_at: string | null
          reopened_reason: string | null
          schedule_arrival: string | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          status: string | null
          status_updated_at: string | null
          store: string | null
          timestamp: string
        }
        Insert: {
          archived?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          cross_dock_destination?: string | null
          cross_dock_eta_date?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          plant?: string | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          reopened_at?: string | null
          reopened_reason?: string | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          timestamp: string
        }
        Update: {
          archived?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          cross_dock_destination?: string | null
          cross_dock_eta_date?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          plant?: string | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          reopened_at?: string | null
          reopened_reason?: string | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          header_image_url: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          header_image_url?: string | null
          id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          header_image_url?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      warranty_orders: {
        Row: {
          condition: string | null
          created_at: string
          customer_name: string | null
          date_submitted: string | null
          dot_number: string | null
          email: string | null
          id: string
          invoice_url: string | null
          name: string | null
          notes: string | null
          photo_urls: string[] | null
          plant: string
          status: string
          store: string | null
          tire_size: string | null
          tire_type: string | null
          updated_at: string
          user_id: string | null
          work_order: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string
          customer_name?: string | null
          date_submitted?: string | null
          dot_number?: string | null
          email?: string | null
          id?: string
          invoice_url?: string | null
          name?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          plant: string
          status?: string
          store?: string | null
          tire_size?: string | null
          tire_type?: string | null
          updated_at?: string
          user_id?: string | null
          work_order?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string
          customer_name?: string | null
          date_submitted?: string | null
          dot_number?: string | null
          email?: string | null
          id?: string
          invoice_url?: string | null
          name?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          plant?: string
          status?: string
          store?: string | null
          tire_size?: string | null
          tire_type?: string | null
          updated_at?: string
          user_id?: string | null
          work_order?: string | null
        }
        Relationships: []
      }
      wheel_orders: {
        Row: {
          completed: boolean | null
          completedat: string | null
          crossdockdestination: string | null
          crossdocketadate: string | null
          crossdockformlink: string | null
          crossdockreceivernumber: string | null
          crossdocktype: string | null
          description: string | null
          desiredcolor: string | null
          destinationmanageremail: string | null
          duedate: string | null
          email: string | null
          emailmessage: string | null
          handholes: number | null
          id: string
          name: string | null
          notes: string | null
          ordertype: string | null
          plant: string | null
          productnumber: string | null
          quantity: number | null
          receivedat: string | null
          schedulearrival: string | null
          sendemailtrigger: boolean | null
          status: string | null
          statusupdatedat: string | null
          store: string | null
          timestamp: string | null
          wheelmaterial: string | null
          wheelsize: string | null
          wheelsreceived: boolean | null
          wheeltype: string | null
          workorderlink: string | null
        }
        Insert: {
          completed?: boolean | null
          completedat?: string | null
          crossdockdestination?: string | null
          crossdocketadate?: string | null
          crossdockformlink?: string | null
          crossdockreceivernumber?: string | null
          crossdocktype?: string | null
          description?: string | null
          desiredcolor?: string | null
          destinationmanageremail?: string | null
          duedate?: string | null
          email?: string | null
          emailmessage?: string | null
          handholes?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          ordertype?: string | null
          plant?: string | null
          productnumber?: string | null
          quantity?: number | null
          receivedat?: string | null
          schedulearrival?: string | null
          sendemailtrigger?: boolean | null
          status?: string | null
          statusupdatedat?: string | null
          store?: string | null
          timestamp?: string | null
          wheelmaterial?: string | null
          wheelsize?: string | null
          wheelsreceived?: boolean | null
          wheeltype?: string | null
          workorderlink?: string | null
        }
        Update: {
          completed?: boolean | null
          completedat?: string | null
          crossdockdestination?: string | null
          crossdocketadate?: string | null
          crossdockformlink?: string | null
          crossdockreceivernumber?: string | null
          crossdocktype?: string | null
          description?: string | null
          desiredcolor?: string | null
          destinationmanageremail?: string | null
          duedate?: string | null
          email?: string | null
          emailmessage?: string | null
          handholes?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          ordertype?: string | null
          plant?: string | null
          productnumber?: string | null
          quantity?: number | null
          receivedat?: string | null
          schedulearrival?: string | null
          sendemailtrigger?: boolean | null
          status?: string | null
          statusupdatedat?: string | null
          store?: string | null
          timestamp?: string | null
          wheelmaterial?: string | null
          wheelsize?: string | null
          wheelsreceived?: boolean | null
          wheeltype?: string | null
          workorderlink?: string | null
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
