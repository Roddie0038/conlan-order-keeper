export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adjustments: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      admin_dashboard_summary: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      admin_message_delivery_log_summary: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      alert_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_config: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_email_types: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_internal_secret: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_plant_regions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_plants: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_platform_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          platform_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          platform_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          platform_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_platform_audit_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "app_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      app_platform_links: {
        Row: {
          created_at: string | null
          hmac_algorithm: string | null
          hmac_enabled: boolean | null
          id: string
          is_active: boolean | null
          max_retries: number | null
          metadata: Json | null
          platform_id: string | null
          rate_limit_per_minute: number | null
          retry_enabled: boolean | null
          timeout_seconds: number | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          hmac_algorithm?: string | null
          hmac_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          metadata?: Json | null
          platform_id?: string | null
          rate_limit_per_minute?: number | null
          retry_enabled?: boolean | null
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_type: string
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          hmac_algorithm?: string | null
          hmac_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          metadata?: Json | null
          platform_id?: string | null
          rate_limit_per_minute?: number | null
          retry_enabled?: boolean | null
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_platform_links_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "app_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      app_platforms: {
        Row: {
          base_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          platform_key: string
          platform_name: string
          rate_limit_per_minute: number | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          platform_key: string
          platform_name: string
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          platform_key?: string
          platform_name?: string
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      app_regions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_stores: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      app_webhook_deliveries: {
        Row: {
          attempt: number
          created_at: string
          delivered_at: string | null
          destination_url: string
          error_message: string | null
          event_id: string
          id: string
          outbox_id: string | null
          request_body: Json
          request_headers: Json
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          trace_id: string | null
        }
        Insert: {
          attempt?: number
          created_at?: string
          delivered_at?: string | null
          destination_url: string
          error_message?: string | null
          event_id: string
          id?: string
          outbox_id?: string | null
          request_body?: Json
          request_headers?: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          trace_id?: string | null
        }
        Update: {
          attempt?: number
          created_at?: string
          delivered_at?: string | null
          destination_url?: string
          error_message?: string | null
          event_id?: string
          id?: string
          outbox_id?: string | null
          request_body?: Json
          request_headers?: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          trace_id?: string | null
        }
        Relationships: []
      }
      approved_treads: {
        Row: {
          category: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          notes: string | null
          status: string | null
          tread_code: string | null
        }
        Insert: {
          category?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          status?: string | null
          tread_code?: string | null
        }
        Update: {
          category?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          status?: string | null
          tread_code?: string | null
        }
        Relationships: []
      }
      backfill_run_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      complaint_email_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      complaint_email_logs_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      complaints: {
        Row: {
          id: number
          store_number: string | null
        }
        Insert: {
          id?: number
          store_number?: string | null
        }
        Update: {
          id?: number
          store_number?: string | null
        }
        Relationships: []
      }
      cross_dock_forms: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      cross_dock_request_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          request_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          request_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          request_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_dock_request_audit_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "cross_dock_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_dock_request_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          product_number: string
          quantity: number
          request_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          product_number: string
          quantity?: number
          request_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          product_number?: string
          quantity?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_dock_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "cross_dock_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_dock_requests: {
        Row: {
          created_at: string
          desired_delivery_date: string | null
          id: string
          notes: string | null
          plant: string
          request_number: string
          requesting_store: string
          sending_store: string
          status: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          desired_delivery_date?: string | null
          id?: string
          notes?: string | null
          plant: string
          request_number: string
          requesting_store: string
          sending_store: string
          status?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          desired_delivery_date?: string | null
          id?: string
          notes?: string | null
          plant?: string
          request_number?: string
          requesting_store?: string
          sending_store?: string
          status?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      draft_telemetry_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      edge_function_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_template_versions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_template_versions_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_trigger_usage_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      email_triggers: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      event_receipts: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_duration_ms: number | null
          received_at: string
          source: string
          status: string
          trace_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_duration_ms?: number | null
          received_at?: string
          source: string
          status?: string
          trace_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_duration_ms?: number | null
          received_at?: string
          source?: string
          status?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      failed_webhooks: {
        Row: {
          created_at: string
          error_message: string
          event_id: string
          event_type: string
          id: string
          last_attempt_at: string
          max_retries: number
          next_retry_at: string | null
          payload: Json
          resolution_notes: string | null
          resolved_at: string | null
          retry_count: number
          source: string
          trace_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          event_id: string
          event_type: string
          id?: string
          last_attempt_at?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          retry_count?: number
          source: string
          trace_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          event_id?: string
          event_type?: string
          id?: string
          last_attempt_at?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          retry_count?: number
          source?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      global_email_settings: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      http_call_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      inventory_cache: {
        Row: {
          created_at: string
          id: string
          last_updated_at: string
          metadata: Json | null
          plant: string
          product_number: string
          quantity: number
          status: string
          sync_trace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated_at?: string
          metadata?: Json | null
          plant: string
          product_number: string
          quantity?: number
          status?: string
          sync_trace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_updated_at?: string
          metadata?: Json | null
          plant?: string
          product_number?: string
          quantity?: number
          status?: string
          sync_trace_id?: string | null
        }
        Relationships: []
      }
      inventory_counts: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      inventory_sync_log: {
        Row: {
          event_id: string
          id: string
          metadata: Json | null
          new_quantity: number | null
          old_quantity: number | null
          plant: string
          product_number: string
          sync_type: string
          synced_at: string
          trace_id: string | null
        }
        Insert: {
          event_id: string
          id?: string
          metadata?: Json | null
          new_quantity?: number | null
          old_quantity?: number | null
          plant: string
          product_number: string
          sync_type: string
          synced_at?: string
          trace_id?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          metadata?: Json | null
          new_quantity?: number | null
          old_quantity?: number | null
          plant?: string
          product_number?: string
          sync_type?: string
          synced_at?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      inventory_users: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      kv: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      label_template_versions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      label_templates: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_by: string | null
          email: string | null
          full_name: string | null
          id: number
          is_active: boolean | null
          plant_code: string | null
          platform: string | null
          role: string | null
          status: string | null
          store_number: string | null
        }
        Insert: {
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          is_active?: boolean | null
          plant_code?: string | null
          platform?: string | null
          role?: string | null
          status?: string | null
          store_number?: string | null
        }
        Update: {
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          is_active?: boolean | null
          plant_code?: string | null
          platform?: string | null
          role?: string | null
          status?: string | null
          store_number?: string | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          file_name: string | null
          file_url: string | null
          id: number
        }
        Insert: {
          file_name?: string | null
          file_url?: string | null
          id?: number
        }
        Update: {
          file_name?: string | null
          file_url?: string | null
          id?: number
        }
        Relationships: []
      }
      message_delivery_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      message_read_status: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          id: number
          is_active: boolean | null
        }
        Insert: {
          id?: number
          is_active?: boolean | null
        }
        Update: {
          id?: number
          is_active?: boolean | null
        }
        Relationships: []
      }
      mto_email_outbox: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      mto_order_progress_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      mto_orders: {
        Row: {
          casing_grade: string | null
          created_at: string
          id: number
          idempotency_key: string | null
          invoice_number: string | null
          mto_number: string
          normalized_store: string
          notes: string | null
          order_number: string | null
          plant: string
          product_number: string
          promised_date: string | null
          quantity: number
          role: string | null
          status: string
          store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          tire_size: string | null
          tread: string | null
          updated_at: string
        }
        Insert: {
          casing_grade?: string | null
          created_at?: string
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          mto_number: string
          normalized_store: string
          notes?: string | null
          order_number?: string | null
          plant: string
          product_number: string
          promised_date?: string | null
          quantity?: number
          role?: string | null
          status?: string
          store: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_size?: string | null
          tread?: string | null
          updated_at?: string
        }
        Update: {
          casing_grade?: string | null
          created_at?: string
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          mto_number?: string
          normalized_store?: string
          notes?: string | null
          order_number?: string | null
          plant?: string
          product_number?: string
          promised_date?: string | null
          quantity?: number
          role?: string | null
          status?: string
          store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_size?: string | null
          tread?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mto_work_orders: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      mto_writeup_audit: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_delivery_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_delivery_log_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_idempotency: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempt_count: number
          created_at: string | null
          destination_url: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number
          notification_type: string
          request_body: Json
          response_body: Json | null
          status: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string | null
          destination_url: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          notification_type: string
          request_body: Json
          response_body?: Json | null
          status?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string | null
          destination_url?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          notification_type?: string
          request_body?: Json
          response_body?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      notification_queue_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      notification_routing_rules: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      oos_events: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      oos_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      oos_status: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      order_crossplant_audit: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      order_drafts: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      order_email_overrides: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      order_notification_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ordering_directory: {
        Row: {
          can_access_ordering: boolean | null
          email: string
          full_name: string | null
          permissions_override: Json | null
          primary_plant_code: string | null
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_access_ordering?: boolean | null
          email: string
          full_name?: string | null
          permissions_override?: Json | null
          primary_plant_code?: string | null
          role: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_access_ordering?: boolean | null
          email?: string
          full_name?: string | null
          permissions_override?: Json | null
          primary_plant_code?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ordering_email_logs: {
        Row: {
          body_html: string | null
          email_sent: boolean | null
          id: number
          metadata: Json | null
          order_id: number | null
          order_table: string | null
          recipient_email: string | null
          sent_at: string | null
          subject: string | null
        }
        Insert: {
          body_html?: string | null
          email_sent?: boolean | null
          id?: number
          metadata?: Json | null
          order_id?: number | null
          order_table?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          subject?: string | null
        }
        Update: {
          body_html?: string | null
          email_sent?: boolean | null
          id?: number
          metadata?: Json | null
          order_id?: number | null
          order_table?: string | null
          recipient_email?: string | null
          sent_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      ordering_email_logs_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ordering_email_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ordering_email_recipients_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          description: string | null
          id: number
          invoice_number: string | null
          normalized_store: string
          order_number: string
          order_type: string
          plant: string
          quantity: number | null
          role: string | null
          status: string
          store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          tire_size: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          invoice_number?: string | null
          normalized_store: string
          order_number: string
          order_type: string
          plant: string
          quantity?: number | null
          role?: string | null
          status?: string
          store: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_size?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          invoice_number?: string | null
          normalized_store?: string
          order_number?: string
          order_type?: string
          plant?: string
          quantity?: number | null
          role?: string | null
          status?: string
          store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders_public_api: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      orders_transfer_backfill_snapshot: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_auth_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_dashboard_mto_orders: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_orders: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          order_number: string
          plant: string
          product_number: string
          quantity: number
          status: string
          store: string
          submitted_by_email: string
          submitted_by_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          order_number: string
          plant: string
          product_number: string
          quantity: number
          status?: string
          store: string
          submitted_by_email: string
          submitted_by_name: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          order_number?: string
          plant?: string
          product_number?: string
          quantity?: number
          status?: string
          store?: string
          submitted_by_email?: string
          submitted_by_name?: string
        }
        Relationships: []
      }
      ot_password_resets: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_password_resets_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_plants: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_plants_audit_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_platform_users: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_platform_users_searchable: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_stores: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_user_sessions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      ot_user_sessions_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      pending_registrations: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      pending_user_registrations: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      pending_user_registrations_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      plant_admins: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      plant_admins_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      plant_email_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      plant_normalization_verification: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      plant_switch_logs: {
        Row: {
          current_plant: string | null
          id: number
          last_plant_switch: string | null
          user_id: string | null
        }
        Insert: {
          current_plant?: string | null
          id?: number
          last_plant_switch?: string | null
          user_id?: string | null
        }
        Update: {
          current_plant?: string | null
          id?: number
          last_plant_switch?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      platform_access_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      platform_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: number
          normalized_store: string | null
          plant: string | null
          role: string
          status: string
          store: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: number
          normalized_store?: string | null
          plant?: string | null
          role: string
          status?: string
          store?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: number
          normalized_store?: string | null
          plant?: string | null
          role?: string
          status?: string
          store?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_users_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      recent_message_reads: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      recipient_action_logs: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      regional_message_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      regional_message_recipients_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      regional_messages: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      scan_events: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      shipments: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      skus: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      stg_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      store_display: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      store_email_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      store_email_recipients_quarantine: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      store_user_roles: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      system_admins: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      training_downloads: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          id: number
          is_typing: boolean | null
          order_id: number | null
          updated_at: string | null
          user_email: string | null
        }
        Insert: {
          id?: number
          is_typing?: boolean | null
          order_id?: number | null
          updated_at?: string | null
          user_email?: string | null
        }
        Update: {
          id?: number
          is_typing?: boolean | null
          order_id?: number | null
          updated_at?: string | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "typing_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      unread_message_summary: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      unread_order_messages_per_store: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      unread_regional_messages_per_plant: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string | null
          affected_user: string | null
          description: string | null
          id: number
          metadata: Json | null
          performed_by: string | null
          platform: string | null
          timestamp: string | null
        }
        Insert: {
          action?: string | null
          affected_user?: string | null
          description?: string | null
          id?: number
          metadata?: Json | null
          performed_by?: string | null
          platform?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string | null
          affected_user?: string | null
          description?: string | null
          id?: number
          metadata?: Json | null
          performed_by?: string | null
          platform?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          current_plant: string | null
          current_store: string | null
          email: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_plant?: string | null
          current_store?: string | null
          email: string
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_plant?: string | null
          current_store?: string | null
          email?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      v_enums: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_oos_effective_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_oos_watchlist: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_orders_missing_regions: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_plants_for_consumers: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_role_type_policy_violations: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      v_stores_overview: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      variance_alerts: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      vw_active_email_recipients: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_email_admins_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_email_message_threads_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_email_recipients_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_email_triggers_backup: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_trigger_notes: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warehouse_trigger_notes_quarantine_20250826: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      warranty_orders: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          claim_type: string | null
          created_at: string
          denial_reason_code: string | null
          denial_reason_other: string | null
          denied_at: string | null
          denied_by: string | null
          id: number
          idempotency_key: string | null
          invoice_number: string | null
          normalized_store: string
          photos_provided: boolean | null
          plant: string
          quantity: number
          reason_code: string | null
          reason_notes: string | null
          role: string | null
          status: string
          store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          tire_brand: string | null
          tire_description: string | null
          tire_size: string | null
          updated_at: string
          warranty_number: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          claim_type?: string | null
          created_at?: string
          denial_reason_code?: string | null
          denial_reason_other?: string | null
          denied_at?: string | null
          denied_by?: string | null
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          normalized_store: string
          photos_provided?: boolean | null
          plant: string
          quantity: number
          reason_code?: string | null
          reason_notes?: string | null
          role?: string | null
          status?: string
          store: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_brand?: string | null
          tire_description?: string | null
          tire_size?: string | null
          updated_at?: string
          warranty_number: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          claim_type?: string | null
          created_at?: string
          denial_reason_code?: string | null
          denial_reason_other?: string | null
          denied_at?: string | null
          denied_by?: string | null
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          normalized_store?: string
          photos_provided?: boolean | null
          plant?: string
          quantity?: number
          reason_code?: string | null
          reason_notes?: string | null
          role?: string | null
          status?: string
          store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tire_brand?: string | null
          tire_description?: string | null
          tire_size?: string | null
          updated_at?: string
          warranty_number?: string
        }
        Relationships: []
      }
      webhook_analytics: {
        Row: {
          avg_duration_ms: number | null
          created_at: string | null
          date: string
          failed_deliveries: number | null
          id: string
          platform_link_id: string | null
          successful_deliveries: number | null
          total_deliveries: number | null
        }
        Insert: {
          avg_duration_ms?: number | null
          created_at?: string | null
          date: string
          failed_deliveries?: number | null
          id?: string
          platform_link_id?: string | null
          successful_deliveries?: number | null
          total_deliveries?: number | null
        }
        Update: {
          avg_duration_ms?: number | null
          created_at?: string | null
          date?: string
          failed_deliveries?: number | null
          id?: string
          platform_link_id?: string | null
          successful_deliveries?: number | null
          total_deliveries?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_analytics_platform_link_id_fkey"
            columns: ["platform_link_id"]
            isOneToOne: false
            referencedRelation: "app_platform_links"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          new_values: Json | null
          old_values: Json | null
          platform_id: string | null
          user_email: string | null
          user_id: string | null
          webhook_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          platform_id?: string | null
          user_email?: string | null
          user_id?: string | null
          webhook_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          platform_id?: string | null
          user_email?: string | null
          user_id?: string | null
          webhook_id?: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          hmac_signature: string | null
          id: string
          idempotency_key: string | null
          platform_link_id: string | null
          request_body: Json | null
          request_headers: Json | null
          request_method: string | null
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          retry_count: number | null
          success: boolean | null
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          hmac_signature?: string | null
          id?: string
          idempotency_key?: string | null
          platform_link_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          retry_count?: number | null
          success?: boolean | null
          webhook_type: string
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          hmac_signature?: string | null
          id?: string
          idempotency_key?: string | null
          platform_link_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          retry_count?: number | null
          success?: boolean | null
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_platform_link_id_fkey"
            columns: ["platform_link_id"]
            isOneToOne: false
            referencedRelation: "app_platform_links"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_outbox: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          max_retries: number
          next_retry_at: string | null
          payload: Json
          retry_count: number
          status: string
          trace_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json
          retry_count?: number
          status?: string
          trace_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json
          retry_count?: number
          status?: string
          trace_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_subscriptions: {
        Row: {
          active: boolean | null
          created_at: string | null
          event_type: string
          hmac_enabled: boolean | null
          id: string
          secret_key: string | null
          target_url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          event_type: string
          hmac_enabled?: boolean | null
          id?: string
          secret_key?: string | null
          target_url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          event_type?: string
          hmac_enabled?: boolean | null
          id?: string
          secret_key?: string | null
          target_url?: string
        }
        Relationships: []
      }
      wheel_orders: {
        Row: {
          color: string | null
          created_at: string
          id: number
          idempotency_key: string | null
          invoice_number: string | null
          normalized_store: string
          notes: string | null
          plant: string
          promised_date: string | null
          quantity: number
          received_date: string | null
          role: string | null
          service_type: string | null
          status: string
          store: string
          submitted_by_email: string | null
          submitted_by_name: string | null
          updated_at: string
          wheel_number: string
          wheel_size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          normalized_store: string
          notes?: string | null
          plant: string
          promised_date?: string | null
          quantity: number
          received_date?: string | null
          role?: string | null
          service_type?: string | null
          status?: string
          store: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
          wheel_number: string
          wheel_size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: number
          idempotency_key?: string | null
          invoice_number?: string | null
          normalized_store?: string
          notes?: string | null
          plant?: string
          promised_date?: string | null
          quantity?: number
          received_date?: string | null
          role?: string | null
          service_type?: string | null
          status?: string
          store?: string
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
          wheel_number?: string
          wheel_size?: string | null
        }
        Relationships: []
      }
      zone_summary_view: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      ordering_active_users_v: {
        Row: {
          email: string | null
          full_name: string | null
          id: string | null
          permissions_override: Json | null
          primary_plant_code: string | null
          role: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id?: string | null
          permissions_override?: Json | null
          primary_plant_code?: string | null
          role?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string | null
          permissions_override?: Json | null
          primary_plant_code?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_insert_row: {
        Args: { p_plant: string; p_store: string }
        Returns: boolean
      }
      can_modify_row: {
        Args: { p_plant: string; p_store: string }
        Returns: boolean
      }
      can_read_row: {
        Args: { p_plant: string; p_store: string }
        Returns: boolean
      }
      generate_cross_dock_request_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      jwt_email: { Args: never; Returns: string }
      log_notification_attempt: {
        Args: {
          body: Json
          max_retries?: number
          notif_type: string
          url: string
        }
        Returns: undefined
      }
      normalize_store_name: { Args: { raw: string }; Returns: string }
      safe_http_post: {
        Args: { body: Json; notif_type: string; url: string }
        Returns: Json
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
    Enums: {},
  },
} as const
