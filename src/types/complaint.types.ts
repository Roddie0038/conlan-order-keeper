
export interface Complaint {
  id: string;
  date_submitted: string;
  store_number: string;
  store_name: string;
  sales_person?: string;
  complaint_type: 'Tire Transfer' | 'Retread' | 'Work Order';
  work_order_number?: string;
  order_id?: string;
  issue_type: 'Warehouse' | 'Retread';
  identified_concern: string;
  attachments?: string[];
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submitted_by_name: string;
  submitted_by_email: string;
  admin_response?: string;
  admin_responder?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintData {
  store_number: string;
  store_name: string;
  sales_person?: string;
  complaint_type: 'Tire Transfer' | 'Retread' | 'Work Order';
  work_order_number?: string;
  order_id?: string;
  issue_type: 'Warehouse' | 'Retread';
  identified_concern: string;
  attachments?: File[];
  submitted_by_name: string;
  submitted_by_email: string;
}
