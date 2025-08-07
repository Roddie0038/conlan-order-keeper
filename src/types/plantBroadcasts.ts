export interface PlantBroadcast {
  id: string;
  plant_code: string;
  subject: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlantBroadcastRecipient {
  id: string;
  message_id: string;
  user_id: string;
  user_email: string;
  read_at?: string;
  created_at: string;
}

export interface SendPlantBroadcastData {
  plant_code: string;
  subject: string;
  body: string;
  created_by: string;
}

export interface PlantBroadcastWithRecipients extends PlantBroadcast {
  recipients: PlantBroadcastRecipient[];
  unread_count: number;
  total_recipients: number;
}