
export interface OrderMessage {
  id: string;
  order_id: string;
  order_type: 'orders' | 'mto_orders' | 'wheel_orders';
  message_text: string;
  sender_email: string;
  sender_role: 'store_manager' | 'warehouse_admin';
  sender_name?: string;
  sender_store?: string;
  is_read: boolean;
  created_at: string;
  // New email integration fields
  message_id?: string;
  reply_to_email_id?: string;
  email_sent?: boolean;
  source?: 'platform' | 'email_reply' | 'email_direct';
}

export interface SendMessageData {
  order_id: string;
  order_type: 'orders' | 'mto_orders' | 'wheel_orders';
  message_text: string;
  // UPDATED: These fields are now optional since they're auto-populated by database triggers
  sender_email?: string;
  sender_role?: 'store_manager' | 'warehouse_admin';
  sender_name?: string;
  sender_store?: string;
  source?: 'platform' | 'email_reply' | 'email_direct';
  reply_to_email_id?: string;
}
