export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adjustments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          qty_after: number
          qty_before: number
          reason: string
          sku_id: string
          status: string
          updated_at: string
          user_id: string
          variance: number | null
          zone_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          qty_after: number
          qty_before: number
          reason: string
          sku_id: string
          status?: string
          updated_at?: string
          user_id: string
          variance?: number | null
          zone_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          qty_after?: number
          qty_before?: number
          reason?: string
          sku_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          variance?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string | null
          created_at: string | null
          deleted_at: string
          deleted_by: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          reason: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string
          deleted_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          reason?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string
          deleted_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
        }
        Relationships: []
      }
      alert_log: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string | null
          sku_id: string
          status: string
          trigger_reason: string
          zone_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string | null
          sku_id: string
          status?: string
          trigger_reason: string
          zone_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string | null
          sku_id?: string
          status?: string
          trigger_reason?: string
          zone_id?: string
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
      email_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_email: string
          status: string
          target_id: string
          target_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          new_email: string
          status: string
          target_id: string
          target_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_email?: string
          status?: string
          target_id?: string
          target_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_template: string
          id: string
          is_active: boolean | null
          subject_template: string
          template_name: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          subject_template: string
          template_name: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          subject_template?: string
          template_name?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_trigger_usage_log: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          order_id: string | null
          plant: string
          recipient_email: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          timestamp: string
          trigger_source: string
          trigger_type: Database["public"]["Enums"]["email_type_enum"]
          triggered_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          plant: string
          recipient_email: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          timestamp?: string
          trigger_source: string
          trigger_type: Database["public"]["Enums"]["email_type_enum"]
          triggered_by: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          plant?: string
          recipient_email?: string
          recipient_role?: Database["public"]["Enums"]["recipient_role_enum"]
          timestamp?: string
          trigger_source?: string
          trigger_type?: Database["public"]["Enums"]["email_type_enum"]
          triggered_by?: string
        }
        Relationships: []
      }
      global_email_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      inventory_counts: {
        Row: {
          created_at: string
          id: string
          last_counted_at: string | null
          last_counted_by: string | null
          qty_on_hand: number
          sku_id: string
          target_qty: number | null
          updated_at: string
          variance_threshold: number | null
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_counted_at?: string | null
          last_counted_by?: string | null
          qty_on_hand?: number
          sku_id: string
          target_qty?: number | null
          updated_at?: string
          variance_threshold?: number | null
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_counted_at?: string | null
          last_counted_by?: string | null
          qty_on_hand?: number
          sku_id?: string
          target_qty?: number | null
          updated_at?: string
          variance_threshold?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_counts_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
      inventory_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          plant: string
          role: Database["public"]["Enums"]["inventory_user_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          plant: string
          role?: Database["public"]["Enums"]["inventory_user_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          plant?: string
          role?: Database["public"]["Enums"]["inventory_user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      label_template_versions: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          elements: Json
          height: number
          id: string
          template_id: string | null
          version_name: string
          width: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          elements: Json
          height: number
          id?: string
          template_id?: string | null
          version_name: string
          width: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          elements?: Json
          height?: number
          id?: string
          template_id?: string | null
          version_name?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "label_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "label_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      label_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          element_count: number | null
          elements: Json
          height: number
          id: string
          is_favorite: boolean | null
          is_featured: boolean | null
          is_shared: boolean | null
          name: string
          updated_at: string | null
          width: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          element_count?: number | null
          elements: Json
          height: number
          id?: string
          is_favorite?: boolean | null
          is_featured?: boolean | null
          is_shared?: boolean | null
          name: string
          updated_at?: string | null
          width: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          element_count?: number | null
          elements?: Json
          height?: number
          id?: string
          is_favorite?: boolean | null
          is_featured?: boolean | null
          is_shared?: boolean | null
          name?: string
          updated_at?: string | null
          width?: number
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
      message_attachments: {
        Row: {
          created_at: string | null
          download_count: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
          storage_path: string
          updated_at: string | null
          uploaded_by: string
          virus_scan_status: string | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
          storage_path: string
          updated_at?: string | null
          uploaded_by: string
          virus_scan_status?: string | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          storage_path?: string
          updated_at?: string | null
          uploaded_by?: string
          virus_scan_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "order_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_email: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_email: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "order_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by_email: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by_email: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by_email?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
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
      mto_orders_backup: {
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
          id: string | null
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
          id?: string | null
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
          id?: string | null
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
      notification_delivery_log: {
        Row: {
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_provider: string
          delivery_status: string
          error_details: string | null
          id: string
          notification_id: string | null
          opened_at: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_role: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_provider?: string
          delivery_status: string
          error_details?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_role: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_provider?: string
          delivery_status?: string
          error_details?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          created_at: string | null
          cross_dock_order: boolean | null
          email_provider: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          order_id: string | null
          order_number: string | null
          order_type: string | null
          plant: string | null
          platform: string | null
          recipient_email: string
          recipient_role: string | null
          sent_at: string | null
          status: string | null
          store: string | null
          template_used: string | null
        }
        Insert: {
          created_at?: string | null
          cross_dock_order?: boolean | null
          email_provider?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          order_id?: string | null
          order_number?: string | null
          order_type?: string | null
          plant?: string | null
          platform?: string | null
          recipient_email: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
          store?: string | null
          template_used?: string | null
        }
        Update: {
          created_at?: string | null
          cross_dock_order?: boolean | null
          email_provider?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          order_id?: string | null
          order_number?: string | null
          order_type?: string | null
          plant?: string | null
          platform?: string | null
          recipient_email?: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
          store?: string | null
          template_used?: string | null
        }
        Relationships: []
      }
      notification_logs_backup: {
        Row: {
          created_at: string | null
          cross_dock_order: boolean | null
          email_provider: string | null
          error_message: string | null
          id: string | null
          metadata: Json | null
          notification_type: string | null
          order_id: string | null
          order_number: string | null
          order_type: string | null
          plant: string | null
          platform: string | null
          recipient_email: string | null
          recipient_role: string | null
          sent_at: string | null
          status: string | null
          store: string | null
          template_used: string | null
        }
        Insert: {
          created_at?: string | null
          cross_dock_order?: boolean | null
          email_provider?: string | null
          error_message?: string | null
          id?: string | null
          metadata?: Json | null
          notification_type?: string | null
          order_id?: string | null
          order_number?: string | null
          order_type?: string | null
          plant?: string | null
          platform?: string | null
          recipient_email?: string | null
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
          store?: string | null
          template_used?: string | null
        }
        Update: {
          created_at?: string | null
          cross_dock_order?: boolean | null
          email_provider?: string | null
          error_message?: string | null
          id?: string | null
          metadata?: Json | null
          notification_type?: string | null
          order_id?: string | null
          order_number?: string | null
          order_type?: string | null
          plant?: string | null
          platform?: string | null
          recipient_email?: string | null
          recipient_role?: string | null
          sent_at?: string | null
          status?: string | null
          store?: string | null
          template_used?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          max_retries: number
          metadata: Json | null
          order_id: string | null
          order_type: string
          plant: string
          priority: number
          processed_at: string | null
          recipients: Json
          retry_count: number
          scheduled_at: string
          status: string
          store_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          max_retries?: number
          metadata?: Json | null
          order_id?: string | null
          order_type: string
          plant: string
          priority?: number
          processed_at?: string | null
          recipients?: Json
          retry_count?: number
          scheduled_at?: string
          status?: string
          store_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          metadata?: Json | null
          order_id?: string | null
          order_type?: string
          plant?: string
          priority?: number
          processed_at?: string | null
          recipients?: Json
          retry_count?: number
          scheduled_at?: string
          status?: string
          store_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_queue_backup: {
        Row: {
          created_at: string | null
          email_type: string | null
          error_message: string | null
          id: string | null
          max_retries: number | null
          metadata: Json | null
          order_id: string | null
          order_type: string | null
          plant: string | null
          priority: number | null
          processed_at: string | null
          recipients: Json | null
          retry_count: number | null
          scheduled_at: string | null
          status: string | null
          store_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_type?: string | null
          error_message?: string | null
          id?: string | null
          max_retries?: number | null
          metadata?: Json | null
          order_id?: string | null
          order_type?: string | null
          plant?: string | null
          priority?: number | null
          processed_at?: string | null
          recipients?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string | null
          error_message?: string | null
          id?: string | null
          max_retries?: number | null
          metadata?: Json | null
          order_id?: string | null
          order_type?: string | null
          plant?: string | null
          priority?: number | null
          processed_at?: string | null
          recipients?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string | null
          store_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_routing_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          email_type: string
          id: string
          is_enabled: boolean
          recipient_role: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          email_type: string
          id?: string
          is_enabled?: boolean
          recipient_role: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          email_type?: string
          id?: string
          is_enabled?: boolean
          recipient_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          email_sent: boolean | null
          id: string
          is_read: boolean | null
          message_id: string | null
          message_text: string
          message_type: string | null
          order_id: string | null
          order_type: string
          priority: string | null
          reply_to_email_id: string | null
          reply_to_message_id: string | null
          sender_email: string
          sender_name: string | null
          sender_role: string
          sender_store: string | null
          source: string | null
          thread_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_text: string
          message_type?: string | null
          order_id?: string | null
          order_type: string
          priority?: string | null
          reply_to_email_id?: string | null
          reply_to_message_id?: string | null
          sender_email: string
          sender_name?: string | null
          sender_role: string
          sender_store?: string | null
          source?: string | null
          thread_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          message_text?: string
          message_type?: string | null
          order_id?: string | null
          order_type?: string
          priority?: string | null
          reply_to_email_id?: string | null
          reply_to_message_id?: string | null
          sender_email?: string
          sender_name?: string | null
          sender_role?: string
          sender_store?: string | null
          source?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "order_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ordering_email_logs: {
        Row: {
          created_at: string | null
          email_type: string | null
          error_details: string | null
          id: number
          order_id: string | null
          order_type: string | null
          recipient_email: string | null
          response: string | null
          status: string | null
          store_number: string | null
        }
        Insert: {
          created_at?: string | null
          email_type?: string | null
          error_details?: string | null
          id?: never
          order_id?: string | null
          order_type?: string | null
          recipient_email?: string | null
          response?: string | null
          status?: string | null
          store_number?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string | null
          error_details?: string | null
          id?: never
          order_id?: string | null
          order_type?: string | null
          recipient_email?: string | null
          response?: string | null
          status?: string | null
          store_number?: string | null
        }
        Relationships: []
      }
      ordering_email_logs_backup: {
        Row: {
          created_at: string | null
          email_type: string | null
          error_details: string | null
          id: number | null
          order_id: string | null
          order_type: string | null
          recipient_email: string | null
          response: string | null
          status: string | null
          store_number: string | null
        }
        Insert: {
          created_at?: string | null
          email_type?: string | null
          error_details?: string | null
          id?: number | null
          order_id?: string | null
          order_type?: string | null
          recipient_email?: string | null
          response?: string | null
          status?: string | null
          store_number?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string | null
          error_details?: string | null
          id?: number | null
          order_id?: string | null
          order_type?: string | null
          recipient_email?: string | null
          response?: string | null
          status?: string | null
          store_number?: string | null
        }
        Relationships: []
      }
      ordering_email_recipients: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: string | null
          id: number
          is_active: boolean | null
          notification_types: string[] | null
          plant: string | null
          recipient_email: string
          role: string | null
          store_name: string | null
          store_number: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          id?: never
          is_active?: boolean | null
          notification_types?: string[] | null
          plant?: string | null
          recipient_email: string
          role?: string | null
          store_name?: string | null
          store_number?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          id?: never
          is_active?: boolean | null
          notification_types?: string[] | null
          plant?: string | null
          recipient_email?: string
          role?: string | null
          store_name?: string | null
          store_number?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      ordering_email_recipients_backup: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: string | null
          id: number | null
          is_active: boolean | null
          notification_types: string[] | null
          plant: string | null
          recipient_email: string | null
          role: string | null
          store_name: string | null
          store_number: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          id?: number | null
          is_active?: boolean | null
          notification_types?: string[] | null
          plant?: string | null
          recipient_email?: string | null
          role?: string | null
          store_name?: string | null
          store_number?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string | null
          id?: number | null
          is_active?: boolean | null
          notification_types?: string[] | null
          plant?: string | null
          recipient_email?: string | null
          role?: string | null
          store_name?: string | null
          store_number?: string | null
          user_role?: string | null
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
          cross_plant_order: boolean | null
          deleted_at: string | null
          description: string | null
          destination_manager_email: string | null
          email: string | null
          email_message: string | null
          id: number
          in_transit_at: string | null
          invoice_number: string | null
          manager_notes: string | null
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
          tire_pull_status: string | null
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
          cross_plant_order?: boolean | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          manager_notes?: string | null
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
          tire_pull_status?: string | null
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
          cross_plant_order?: boolean | null
          deleted_at?: string | null
          description?: string | null
          destination_manager_email?: string | null
          email?: string | null
          email_message?: string | null
          id?: number
          in_transit_at?: string | null
          invoice_number?: string | null
          manager_notes?: string | null
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
          tire_pull_status?: string | null
          warehouse_received?: boolean | null
        }
        Relationships: []
      }
      ot_auth_logs: {
        Row: {
          error_message: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          success: boolean
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          success: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          success?: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_auth_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ot_platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_password_resets: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          reset_token: string
          used_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          reset_token: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          reset_token?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_password_resets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ot_platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_platform_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          email_group: string | null
          email_verified: boolean | null
          failed_login_attempts: number | null
          full_name: string
          id: string
          is_super_admin: boolean | null
          last_login: string | null
          locked_until: string | null
          must_change_password: boolean | null
          password_reset_expires: string | null
          password_reset_token: string | null
          plant: string | null
          role: Database["public"]["Enums"]["ot_user_role"]
          role_classification: string | null
          status: Database["public"]["Enums"]["ot_user_status"] | null
          store: string | null
          temporary_password_expires_at: string | null
          temporary_password_set_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          email_group?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          full_name: string
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          must_change_password?: boolean | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          plant?: string | null
          role: Database["public"]["Enums"]["ot_user_role"]
          role_classification?: string | null
          status?: Database["public"]["Enums"]["ot_user_status"] | null
          store?: string | null
          temporary_password_expires_at?: string | null
          temporary_password_set_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          email_group?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          must_change_password?: boolean | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          plant?: string | null
          role?: Database["public"]["Enums"]["ot_user_role"]
          role_classification?: string | null
          status?: Database["public"]["Enums"]["ot_user_status"] | null
          store?: string | null
          temporary_password_expires_at?: string | null
          temporary_password_set_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ot_user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_accessed: string | null
          platform: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed?: string | null
          platform?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_accessed?: string | null
          platform?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ot_platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_registrations: {
        Row: {
          admin_reviewed: boolean | null
          approved_by: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          password_hash: string
          plant_code: string
          reviewed_at: string | null
          role_title: string
          status: string | null
          store_number: string
          verified_at: string | null
        }
        Insert: {
          admin_reviewed?: boolean | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          password_hash: string
          plant_code: string
          reviewed_at?: string | null
          role_title: string
          status?: string | null
          store_number: string
          verified_at?: string | null
        }
        Update: {
          admin_reviewed?: boolean | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          password_hash?: string
          plant_code?: string
          reviewed_at?: string | null
          role_title?: string
          status?: string | null
          store_number?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      pending_user_registrations: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          plant: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          store: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          plant?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: string | null
          store?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          plant?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          store?: string | null
        }
        Relationships: []
      }
      plant_admins: {
        Row: {
          created_at: string
          id: string
          plant: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plant: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plant?: string
          user_id?: string
        }
        Relationships: []
      }
      plant_email_recipients: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          plant_manager_email: string
          plant_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          plant_manager_email: string
          plant_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          plant_manager_email?: string
          plant_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      plant_switch_logs: {
        Row: {
          created_at: string | null
          from_plant: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          switch_reason: string | null
          to_plant: string
          user_agent: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_plant: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          switch_reason?: string | null
          to_plant: string
          user_agent?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_plant?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          switch_reason?: string | null
          to_plant?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_access_logs: {
        Row: {
          access_granted: boolean | null
          access_method: string | null
          auth_email: string | null
          auth_role: string | null
          auth_uid: string | null
          error_message: string | null
          id: string
          platform_requested: string | null
          timestamp: string | null
        }
        Insert: {
          access_granted?: boolean | null
          access_method?: string | null
          auth_email?: string | null
          auth_role?: string | null
          auth_uid?: string | null
          error_message?: string | null
          id?: string
          platform_requested?: string | null
          timestamp?: string | null
        }
        Update: {
          access_granted?: boolean | null
          access_method?: string | null
          auth_email?: string | null
          auth_role?: string | null
          auth_uid?: string | null
          error_message?: string | null
          id?: string
          platform_requested?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      platform_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          must_change_password: boolean | null
          plant: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          store: string | null
          temporary_password_expires_at: string | null
          temporary_password_set_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          must_change_password?: boolean | null
          plant?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          store?: string | null
          temporary_password_expires_at?: string | null
          temporary_password_set_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          must_change_password?: boolean | null
          plant?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          store?: string | null
          temporary_password_expires_at?: string | null
          temporary_password_set_at?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          plant_code: string | null
          role: string
          store: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          plant_code?: string | null
          role: string
          store: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          plant_code?: string | null
          role?: string
          store?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scan_events: {
        Row: {
          device_id: string | null
          id: string
          notes: string | null
          qty_scanned: number
          scan_type: string
          sku_id: string
          synced_at: string | null
          timestamp: string
          user_id: string
          zone_id: string
        }
        Insert: {
          device_id?: string | null
          id?: string
          notes?: string | null
          qty_scanned: number
          scan_type?: string
          sku_id: string
          synced_at?: string | null
          timestamp?: string
          user_id: string
          zone_id: string
        }
        Update: {
          device_id?: string | null
          id?: string
          notes?: string | null
          qty_scanned?: number
          scan_type?: string
          sku_id?: string
          synced_at?: string | null
          timestamp?: string
          user_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_events_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_events_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_events_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      skus: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          location: string | null
          part_number: string
          ply_rating: string | null
          product_code: string
          size: string | null
          uom: string
          updated_at: string
          warehouse: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean
          location?: string | null
          part_number: string
          ply_rating?: string | null
          product_code: string
          size?: string | null
          uom?: string
          updated_at?: string
          warehouse?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          location?: string | null
          part_number?: string
          ply_rating?: string | null
          product_code?: string
          size?: string | null
          uom?: string
          updated_at?: string
          warehouse?: string | null
        }
        Relationships: []
      }
      store_email_recipients: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: Database["public"]["Enums"]["email_type_enum"]
          id: string
          is_active: boolean | null
          platform_source: string | null
          recipient_email: string
          recipient_name: string | null
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          store_name: string
          store_number: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type: Database["public"]["Enums"]["email_type_enum"]
          id?: string
          is_active?: boolean | null
          platform_source?: string | null
          recipient_email: string
          recipient_name?: string | null
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          store_name: string
          store_number: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: Database["public"]["Enums"]["email_type_enum"]
          id?: string
          is_active?: boolean | null
          platform_source?: string | null
          recipient_email?: string
          recipient_name?: string | null
          recipient_role?: Database["public"]["Enums"]["recipient_role_enum"]
          store_name?: string
          store_number?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      system_admins: {
        Row: {
          admin_level: string
          created_at: string
          created_by: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          locked_until: string | null
          login_attempts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_level?: string
          created_at?: string
          created_by?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_level?: string
          created_at?: string
          created_by?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      training_downloads: {
        Row: {
          document_name: string
          download_date: string | null
          id: string
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          document_name: string
          download_date?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          document_name?: string
          download_date?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          expires_at: string | null
          id: string
          is_typing: boolean | null
          last_updated: string | null
          order_id: string
          order_type: string
          user_email: string
          user_name: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_updated?: string | null
          order_id: string
          order_type: string
          user_email: string
          user_name?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_typing?: boolean | null
          last_updated?: string | null
          order_id?: string
          order_type?: string
          user_email?: string
          user_name?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          affected_user: string
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string
          platform: Database["public"]["Enums"]["platform_type"]
          timestamp: string | null
        }
        Insert: {
          action: string
          affected_user: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by: string
          platform: Database["public"]["Enums"]["platform_type"]
          timestamp?: string | null
        }
        Update: {
          action?: string
          affected_user?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          timestamp?: string | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_address: string | null
          enabled: boolean | null
          id: string
          notification_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_address?: string | null
          enabled?: boolean | null
          id?: string
          notification_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ot_platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          allow_plant_switching: boolean | null
          created_at: string | null
          current_plant: string | null
          header_image_url: string | null
          id: string
          last_plant_switch: string | null
          time_format: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          allow_plant_switching?: boolean | null
          created_at?: string | null
          current_plant?: string | null
          header_image_url?: string | null
          id: string
          last_plant_switch?: string | null
          time_format?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          allow_plant_switching?: boolean | null
          created_at?: string | null
          current_plant?: string | null
          header_image_url?: string | null
          id?: string
          last_plant_switch?: string | null
          time_format?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      variance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          sent_to: string[] | null
          sku_id: string
          threshold_exceeded: boolean
          variance_amount: number
          variance_percentage: number
          zone_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          sent_to?: string[] | null
          sku_id: string
          threshold_exceeded?: boolean
          variance_amount: number
          variance_percentage: number
          zone_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          sent_to?: string[] | null
          sku_id?: string
          threshold_exceeded?: boolean
          variance_amount?: number
          variance_percentage?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variance_alerts_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variance_alerts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variance_alerts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_email_admins: {
        Row: {
          assigned_by: string
          assigned_plants: string[]
          created_at: string
          email: string
          email_triggers: string[] | null
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_plants?: string[]
          created_at?: string
          email: string
          email_triggers?: string[] | null
          full_name: string
          id?: string
          is_active?: boolean
          role: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_plants?: string[]
          created_at?: string
          email?: string
          email_triggers?: string[] | null
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_email_message_threads: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          message_body: string
          order_id: string | null
          plant: string
          read: boolean | null
          recipient_role:
            | Database["public"]["Enums"]["recipient_role_enum"]
            | null
          sent_by: string
          status:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message_body: string
          order_id?: string | null
          plant: string
          read?: boolean | null
          recipient_role?:
            | Database["public"]["Enums"]["recipient_role_enum"]
            | null
          sent_by: string
          status?:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message_body?: string
          order_id?: string | null
          plant?: string
          read?: boolean | null
          recipient_role?:
            | Database["public"]["Enums"]["recipient_role_enum"]
            | null
          sent_by?: string
          status?:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      warehouse_email_recipients: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          plant: string
          recipient_email: string
          recipient_name: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          responsibilities: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          plant: string
          recipient_email: string
          recipient_name: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          responsibilities?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          plant?: string
          recipient_email?: string
          recipient_name?: string
          recipient_role?: Database["public"]["Enums"]["recipient_role_enum"]
          responsibilities?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      warehouse_email_triggers: {
        Row: {
          category: Database["public"]["Enums"]["trigger_category"] | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          plant: string
          recipient_email: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          trigger_type: Database["public"]["Enums"]["email_type_enum"]
          updated_at: string
          updated_by: string | null
          use_default_settings: boolean | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["trigger_category"] | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          plant: string
          recipient_email: string
          recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          trigger_type: Database["public"]["Enums"]["email_type_enum"]
          updated_at?: string
          updated_by?: string | null
          use_default_settings?: boolean | null
        }
        Update: {
          category?: Database["public"]["Enums"]["trigger_category"] | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          plant?: string
          recipient_email?: string
          recipient_role?: Database["public"]["Enums"]["recipient_role_enum"]
          trigger_type?: Database["public"]["Enums"]["email_type_enum"]
          updated_at?: string
          updated_by?: string | null
          use_default_settings?: boolean | null
        }
        Relationships: []
      }
      warehouse_trigger_notes: {
        Row: {
          added_by: string
          created_at: string | null
          id: string
          note: string
          status:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          trigger_id: string | null
          updated_at: string | null
        }
        Insert: {
          added_by: string
          created_at?: string | null
          id?: string
          note: string
          status?:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          trigger_id?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string
          created_at?: string | null
          id?: string
          note?: string
          status?:
            | Database["public"]["Enums"]["trigger_review_status_enum"]
            | null
          trigger_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_trigger_notes_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "email_trigger_usage_log"
            referencedColumns: ["id"]
          },
        ]
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
      zones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          last_scanned_at: string | null
          location: string
          plant: string
          sku_default: string | null
          updated_at: string
          zone_alert_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          last_scanned_at?: string | null
          location: string
          plant: string
          sku_default?: string | null
          updated_at?: string
          zone_alert_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          last_scanned_at?: string | null
          location?: string
          plant?: string
          sku_default?: string | null
          updated_at?: string
          zone_alert_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      plant_normalization_verification: {
        Row: {
          non_normalized_plants: number | null
          normalized_plants: number | null
          table_name: string | null
          total_records: number | null
          unique_plant_values: string[] | null
        }
        Relationships: []
      }
      zone_summary_view: {
        Row: {
          avg_fill_rate: number | null
          id: string | null
          label: string | null
          last_scan_activity: string | null
          last_scanned_at: string | null
          location: string | null
          plant: string | null
          sku_count: number | null
          total_items: number | null
          zone_alert_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_user_registration: {
        Args: { registration_id: string; approved_by_email: string }
        Returns: boolean
      }
      archive_order_by_invoice: {
        Args: { p_invoice: string }
        Returns: undefined
      }
      can_manage_plant_users: {
        Args: { target_plant: string }
        Returns: boolean
      }
      clear_temporary_password_requirement: {
        Args: {
          p_user_id: string
          p_platform: Database["public"]["Enums"]["platform_type"]
        }
        Returns: boolean
      }
      create_ot_user_session: {
        Args: {
          p_user_id: string
          p_session_token: string
          p_expires_at: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      generate_temporary_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_inventory_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["inventory_user_role"]
      }
      get_current_ot_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_user_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          email_group: string | null
          email_verified: boolean | null
          failed_login_attempts: number | null
          full_name: string
          id: string
          is_super_admin: boolean | null
          last_login: string | null
          locked_until: string | null
          must_change_password: boolean | null
          password_reset_expires: string | null
          password_reset_token: string | null
          plant: string | null
          role: Database["public"]["Enums"]["ot_user_role"]
          role_classification: string | null
          status: Database["public"]["Enums"]["ot_user_status"] | null
          store: string | null
          temporary_password_expires_at: string | null
          temporary_password_set_at: string | null
          updated_at: string | null
          updated_by: string | null
        }
      }
      get_current_ot_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["ot_user_role"]
      }
      get_current_user_plant: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_notification_recipients: {
        Args: {
          p_notification_type: string
          p_plant?: string
          p_store?: string
        }
        Returns: {
          user_email: string
          user_name: string
          user_role: Database["public"]["Enums"]["ot_user_role"]
        }[]
      }
      get_secure_zone_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          label: string
          location: string
          plant: string
          last_scanned_at: string
          zone_alert_status: string
          total_items: number
          sku_count: number
          avg_fill_rate: number
          last_scan_activity: string
        }[]
      }
      get_store_normalization_verification: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          store_value: string
          normalized_value: string
          status: string
          occurrences: number
        }[]
      }
      get_zone_summaries: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          label: string
          location: string
          plant: string
          last_scanned_at: string
          zone_alert_status: string
          total_items: number
          sku_count: number
          avg_fill_rate: number
          last_scan_activity: string
          minutes_since_scan: number
        }[]
      }
      has_plant_access: {
        Args: { target_plant: string }
        Returns: boolean
      }
      has_store_access: {
        Args: { target_store: string }
        Returns: boolean
      }
      is_cross_plant_order: {
        Args: { order_plant: string; user_default_plant: string }
        Returns: boolean
      }
      is_cross_platform_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_dynamic_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_inventory_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_inventory_lead_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_ot_operations_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_ot_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_admin_by_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      log_email_trigger_usage: {
        Args: {
          p_trigger_type: Database["public"]["Enums"]["email_type_enum"]
          p_plant: string
          p_recipient_email: string
          p_recipient_role: Database["public"]["Enums"]["recipient_role_enum"]
          p_trigger_source: string
          p_triggered_by: string
          p_order_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_ot_auth_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_success: boolean
          p_ip_address?: unknown
          p_user_agent?: string
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      normalize_plant_name: {
        Args: { input_plant: string }
        Returns: string
      }
      normalize_store_format: {
        Args: { input_store: string }
        Returns: string
      }
      normalize_store_name: {
        Args: { input_store: string }
        Returns: string
      }
      normalize_store_number_for_email: {
        Args: { input_store: string }
        Returns: string
      }
      refresh_zone_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_send_transfer_notification: {
        Args: {
          order_id: number
          store: string
          email: string
          role: string
          full_name: string
        }
        Returns: undefined
      }
      save_label_template: {
        Args: {
          p_name: string
          p_width: number
          p_height: number
          p_elements: Json
          p_is_shared?: boolean
        }
        Returns: {
          id: string
          created_at: string
        }[]
      }
      set_temporary_password: {
        Args: {
          p_user_id: string
          p_platform: Database["public"]["Enums"]["platform_type"]
          p_set_by_email: string
        }
        Returns: string
      }
    }
    Enums: {
      email_type_enum:
        | "transfer"
        | "mto"
        | "wheel"
        | "warranty"
        | "completion"
        | "cross_dock"
        | "out_of_stock"
        | "message"
        | "customer_complaints"
      inventory_user_role: "staff" | "lead" | "admin"
      ot_user_role:
        | "super_admin"
        | "operations_manager"
        | "plant_admin"
        | "warehouse_manager"
        | "store_manager"
        | "warehouse_staff"
        | "warehouse_coordinator"
        | "retread_manager"
        | "plant_manager"
        | "office_manager"
        | "service_manager"
        | "team_lead"
      ot_user_status:
        | "active"
        | "inactive"
        | "suspended"
        | "pending_verification"
        | "locked"
      platform_type: "ordering_platform" | "ot_platform"
      recipient_role_enum:
        | "store_manager"
        | "coordinator"
        | "retread_manager"
        | "warehouse_manager"
        | "office_manager"
        | "plant_admin"
        | "assistant_manager"
        | "operations_coordinator"
        | "service_manager"
      trigger_category:
        | "inventory"
        | "production"
        | "fleet_completion"
        | "warranty_qa"
        | "customer_messaging"
      trigger_review_status_enum:
        | "pending"
        | "in_review"
        | "resolved"
        | "flagged"
      user_role:
        | "super_admin"
        | "operations_manager"
        | "plant_admin"
        | "warehouse_manager"
        | "store_manager"
        | "warehouse_staff"
        | "team_lead"
        | "service_manager"
      user_status: "active" | "inactive" | "suspended" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      email_type_enum: [
        "transfer",
        "mto",
        "wheel",
        "warranty",
        "completion",
        "cross_dock",
        "out_of_stock",
        "message",
        "customer_complaints",
      ],
      inventory_user_role: ["staff", "lead", "admin"],
      ot_user_role: [
        "super_admin",
        "operations_manager",
        "plant_admin",
        "warehouse_manager",
        "store_manager",
        "warehouse_staff",
        "warehouse_coordinator",
        "retread_manager",
        "plant_manager",
        "office_manager",
        "service_manager",
        "team_lead",
      ],
      ot_user_status: [
        "active",
        "inactive",
        "suspended",
        "pending_verification",
        "locked",
      ],
      platform_type: ["ordering_platform", "ot_platform"],
      recipient_role_enum: [
        "store_manager",
        "coordinator",
        "retread_manager",
        "warehouse_manager",
        "office_manager",
        "plant_admin",
        "assistant_manager",
        "operations_coordinator",
        "service_manager",
      ],
      trigger_category: [
        "inventory",
        "production",
        "fleet_completion",
        "warranty_qa",
        "customer_messaging",
      ],
      trigger_review_status_enum: [
        "pending",
        "in_review",
        "resolved",
        "flagged",
      ],
      user_role: [
        "super_admin",
        "operations_manager",
        "plant_admin",
        "warehouse_manager",
        "store_manager",
        "warehouse_staff",
        "team_lead",
        "service_manager",
      ],
      user_status: ["active", "inactive", "suspended", "pending"],
    },
  },
} as const
