export interface RegionalMessage {
  id: string;
  plant_code: string;
  subject: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RegionalMessageRecipient {
  id: string;
  message_id: string;
  user_id: string;
  user_email: string;
  read_at?: string;
  created_at: string;
}

export interface SendRegionalMessageData {
  plant_code: string;
  subject: string;
  body: string;
  created_by: string;
}

export interface RegionalMessageWithRecipients extends RegionalMessage {
  recipients: RegionalMessageRecipient[];
  unread_count: number;
  total_recipients: number;
}