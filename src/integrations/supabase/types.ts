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
      admin_audit_log: {
        Row: {
          action: string | null
          created_at: string | null
          deleted_at: string
          deleted_by: string
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string
          deleted_by: string
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string
          deleted_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
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
      complaint_email_logs: {
        Row: {
          complaint_id: string
          created_at: string | null
          email_type: string
          error_details: string | null
          id: string
          message_id: string | null
          sent_to: string
          status: string
          timestamp: string
        }
        Insert: {
          complaint_id: string
          created_at?: string | null
          email_type: string
          error_details?: string | null
          id?: string
          message_id?: string | null
          sent_to: string
          status?: string
          timestamp?: string
        }
        Update: {
          complaint_id?: string
          created_at?: string | null
          email_type?: string
          error_details?: string | null
          id?: string
          message_id?: string | null
          sent_to?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_email_logs_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          acknowledged_at: string | null
          admin_responder: string | null
          admin_response: string | null
          assigned_at: string | null
          assigned_to: string | null
          attachments: string[] | null
          complaint_type: string
          created_at: string | null
          date_submitted: string | null
          deleted_at: string | null
          id: string
          identified_concern: string
          issue_type: string
          notes: Json | null
          order_id: string | null
          resolved_at: string | null
          response_message: string | null
          response_sent_at: string | null
          sales_person: string | null
          status: string | null
          store_name: string
          store_number: string
          submitted_by_email: string
          submitted_by_name: string
          updated_at: string | null
          work_order_number: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          admin_responder?: string | null
          admin_response?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          complaint_type: string
          created_at?: string | null
          date_submitted?: string | null
          deleted_at?: string | null
          id?: string
          identified_concern: string
          issue_type: string
          notes?: Json | null
          order_id?: string | null
          resolved_at?: string | null
          response_message?: string | null
          response_sent_at?: string | null
          sales_person?: string | null
          status?: string | null
          store_name: string
          store_number: string
          submitted_by_email: string
          submitted_by_name: string
          updated_at?: string | null
          work_order_number?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          admin_responder?: string | null
          admin_response?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          complaint_type?: string
          created_at?: string | null
          date_submitted?: string | null
          deleted_at?: string | null
          id?: string
          identified_concern?: string
          issue_type?: string
          notes?: Json | null
          order_id?: string | null
          resolved_at?: string | null
          response_message?: string | null
          response_sent_at?: string | null
          sales_person?: string | null
          status?: string | null
          store_name?: string
          store_number?: string
          submitted_by_email?: string
          submitted_by_name?: string
          updated_at?: string | null
          work_order_number?: string | null
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
      managers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          plant_code: string | null
          role: string | null
          store_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          plant_code?: string | null
          role?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plant_code?: string | null
          role?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mto_orders: {
        Row: {
          casing_grade: string | null
          casings_eta: string | null
          casings_in_stock: boolean | null
          completed: boolean | null
          completed_at: string | null
          cross_dock_form_link: string | null
          deleted_at: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          have_casings: boolean | null
          id: string
          in_transit_at: string | null
          inventory_last_updated: string | null
          invoice_number: string | null
          last_shipment_date: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          pending_quantity: number | null
          plant: string | null
          product_number: string | null
          projected_delivery: string | null
          quantity: number | null
          ready_to_ship_at: string | null
          received_at: string | null
          retread_notified_at: string | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          shipped_quantity: number | null
          status: string | null
          status_updated_at: string | null
          store: string | null
          store_notified_at: string | null
          timestamp: string | null
          tire_size: string | null
          tread: string | null
          tread_eta: string | null
          tread_in_inventory: boolean | null
          tread_in_stock: boolean | null
          type: string | null
          updated_by: string | null
          warehouse_notified_at: string | null
        }
        Insert: {
          casing_grade?: string | null
          casings_eta?: string | null
          casings_in_stock?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          cross_dock_form_link?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          in_transit_at?: string | null
          inventory_last_updated?: string | null
          invoice_number?: string | null
          last_shipment_date?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          pending_quantity?: number | null
          plant?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          retread_notified_at?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          shipped_quantity?: number | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          store_notified_at?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_eta?: string | null
          tread_in_inventory?: boolean | null
          tread_in_stock?: boolean | null
          type?: string | null
          updated_by?: string | null
          warehouse_notified_at?: string | null
        }
        Update: {
          casing_grade?: string | null
          casings_eta?: string | null
          casings_in_stock?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          cross_dock_form_link?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          have_casings?: boolean | null
          id?: string
          in_transit_at?: string | null
          inventory_last_updated?: string | null
          invoice_number?: string | null
          last_shipment_date?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          pending_quantity?: number | null
          plant?: string | null
          product_number?: string | null
          projected_delivery?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          retread_notified_at?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          shipped_quantity?: number | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          store_notified_at?: string | null
          timestamp?: string | null
          tire_size?: string | null
          tread?: string | null
          tread_eta?: string | null
          tread_in_inventory?: boolean | null
          tread_in_stock?: boolean | null
          type?: string | null
          updated_by?: string | null
          warehouse_notified_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          order_id: string
          order_number: string | null
          recipient_email: string
          recipient_role: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          order_id: string
          order_number?: string | null
          recipient_email: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          order_id?: string
          order_number?: string | null
          recipient_email?: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          id: string
          is_read: boolean | null
          message_id: string | null
          message_text: string
          order_id: string
          order_type: string
          reply_to_email_id: string | null
          sender_email: string
          sender_name: string | null
          sender_role: string
          sender_store: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_text: string
          order_id: string
          order_type: string
          reply_to_email_id?: string | null
          sender_email: string
          sender_name?: string | null
          sender_role: string
          sender_store?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_text?: string
          order_id?: string
          order_type?: string
          reply_to_email_id?: string | null
          sender_email?: string
          sender_name?: string | null
          sender_role?: string
          sender_store?: string | null
          source?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          archived: boolean | null
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          confirmation_token: string | null
          cross_dock_destination: string | null
          cross_dock_eta_date: string | null
          cross_dock_form_link: string | null
          cross_dock_receiver_number: string | null
          cross_dock_type: string | null
          deleted_at: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          id: number
          in_transit_at: string | null
          invoice_number: string | null
          manual_override_allowed: boolean | null
          manual_override_reason: string | null
          name: string | null
          notes: string | null
          order_completion_link: string | null
          order_type: string | null
          out_of_stock: boolean | null
          out_of_stock_eta: string | null
          out_of_stock_items: Json | null
          out_of_stock_notes: string | null
          plant: string | null
          product_number: string | null
          pull_sheet_link: string | null
          quantity: number | null
          ready_to_ship_at: string | null
          received_at: string | null
          received_at_warehouse: string | null
          reopened_at: string | null
          reopened_reason: string | null
          response_deadline: string | null
          schedule_arrival: string | null
          send_email_trigger: boolean | null
          send_invoice: boolean | null
          status: string | null
          status_updated_at: string | null
          store: string | null
          store_manager_message: string | null
          store_response_date: string | null
          store_response_status: string | null
          timestamp: string
          warehouse_received: boolean | null
        }
        Insert: {
          archived?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          confirmation_token?: string | null
          cross_dock_destination?: string | null
          cross_dock_eta_date?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          manual_override_allowed?: boolean | null
          manual_override_reason?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          out_of_stock_eta?: string | null
          out_of_stock_items?: Json | null
          out_of_stock_notes?: string | null
          plant?: string | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          received_at_warehouse?: string | null
          reopened_at?: string | null
          reopened_reason?: string | null
          response_deadline?: string | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          store_manager_message?: string | null
          store_response_date?: string | null
          store_response_status?: string | null
          timestamp: string
          warehouse_received?: boolean | null
        }
        Update: {
          archived?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          confirmation_token?: string | null
          cross_dock_destination?: string | null
          cross_dock_eta_date?: string | null
          cross_dock_form_link?: string | null
          cross_dock_receiver_number?: string | null
          cross_dock_type?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          manual_override_allowed?: boolean | null
          manual_override_reason?: string | null
          name?: string | null
          notes?: string | null
          order_completion_link?: string | null
          order_type?: string | null
          out_of_stock?: boolean | null
          out_of_stock_eta?: string | null
          out_of_stock_items?: Json | null
          out_of_stock_notes?: string | null
          plant?: string | null
          product_number?: string | null
          pull_sheet_link?: string | null
          quantity?: number | null
          ready_to_ship_at?: string | null
          received_at?: string | null
          received_at_warehouse?: string | null
          reopened_at?: string | null
          reopened_reason?: string | null
          response_deadline?: string | null
          schedule_arrival?: string | null
          send_email_trigger?: boolean | null
          send_invoice?: boolean | null
          status?: string | null
          status_updated_at?: string | null
          store?: string | null
          store_manager_message?: string | null
          store_response_date?: string | null
          store_response_status?: string | null
          timestamp?: string
          warehouse_received?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string
          store: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role: string
          store: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string
          store?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          header_image_url: string | null
          id: string
          time_format: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          header_image_url?: string | null
          id: string
          time_format?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          header_image_url?: string | null
          id?: string
          time_format?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      warranty_orders: {
        Row: {
          approval_date: string | null
          approval_invoice_number: string | null
          approval_notes: string | null
          approval_status: string | null
          approved_by: string | null
          condition: string | null
          created_at: string
          customer_name: string | null
          date_submitted: string | null
          deleted_at: string | null
          denial_invoice_number: string | null
          denial_reason: string | null
          dot_number: string | null
          email: string | null
          excise_tax_collected: boolean | null
          id: string
          invoice_url: string | null
          load_range: string | null
          mileage_on_tire: string | null
          model_year: string | null
          name: string | null
          notes: string | null
          photo_urls: string[] | null
          plant: string
          purchase_date: string | null
          replacement_product_code: string | null
          signature_url: string | null
          status: string
          store: string | null
          tire_size: string | null
          tire_type: string | null
          updated_at: string
          user_id: string | null
          vehicle_make: string | null
          vin_or_unit: string | null
          wear_percentage: string | null
          wheel_position: string | null
          work_order: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_invoice_number?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_by?: string | null
          condition?: string | null
          created_at?: string
          customer_name?: string | null
          date_submitted?: string | null
          deleted_at?: string | null
          denial_invoice_number?: string | null
          denial_reason?: string | null
          dot_number?: string | null
          email?: string | null
          excise_tax_collected?: boolean | null
          id?: string
          invoice_url?: string | null
          load_range?: string | null
          mileage_on_tire?: string | null
          model_year?: string | null
          name?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          plant: string
          purchase_date?: string | null
          replacement_product_code?: string | null
          signature_url?: string | null
          status?: string
          store?: string | null
          tire_size?: string | null
          tire_type?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_make?: string | null
          vin_or_unit?: string | null
          wear_percentage?: string | null
          wheel_position?: string | null
          work_order?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_invoice_number?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_by?: string | null
          condition?: string | null
          created_at?: string
          customer_name?: string | null
          date_submitted?: string | null
          deleted_at?: string | null
          denial_invoice_number?: string | null
          denial_reason?: string | null
          dot_number?: string | null
          email?: string | null
          excise_tax_collected?: boolean | null
          id?: string
          invoice_url?: string | null
          load_range?: string | null
          mileage_on_tire?: string | null
          model_year?: string | null
          name?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          plant?: string
          purchase_date?: string | null
          replacement_product_code?: string | null
          signature_url?: string | null
          status?: string
          store?: string | null
          tire_size?: string | null
          tire_type?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_make?: string | null
          vin_or_unit?: string | null
          wear_percentage?: string | null
          wheel_position?: string | null
          work_order?: string | null
        }
        Relationships: []
      }
      wheel_orders: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completedat: string | null
          crossdockdestination: string | null
          crossdocketadate: string | null
          crossdockformlink: string | null
          crossdockreceivernumber: string | null
          crossdocktype: string | null
          deleted_at: string | null
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
          received_at: string | null
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
          completed_at?: string | null
          completedat?: string | null
          crossdockdestination?: string | null
          crossdocketadate?: string | null
          crossdockformlink?: string | null
          crossdockreceivernumber?: string | null
          crossdocktype?: string | null
          deleted_at?: string | null
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
          received_at?: string | null
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
          completed_at?: string | null
          completedat?: string | null
          crossdockdestination?: string | null
          crossdocketadate?: string | null
          crossdockformlink?: string | null
          crossdockreceivernumber?: string | null
          crossdocktype?: string | null
          deleted_at?: string | null
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
          received_at?: string | null
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
