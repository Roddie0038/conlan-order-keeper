
import { supabase } from "@/integrations/supabase/client";
import { uploadMultipleFiles } from "@/services/storageService";
import { CreateComplaintData, Complaint } from "@/types/complaint.types";

export const submitComplaint = async (complaintData: CreateComplaintData): Promise<{ data: Complaint | null; error: Error | null }> => {
  try {
    // Upload attachments if any
    let attachmentUrls: string[] = [];
    if (complaintData.attachments && complaintData.attachments.length > 0) {
      attachmentUrls = await uploadMultipleFiles(
        complaintData.attachments,
        'complaint-attachments',
        complaintData.store_number
      );
    }

    // Prepare complaint data for insertion
    const insertData = {
      store_number: complaintData.store_number,
      store_name: complaintData.store_name,
      sales_person: complaintData.sales_person || null,
      complaint_type: complaintData.complaint_type,
      work_order_number: complaintData.work_order_number || null,
      order_id: complaintData.order_id || null,
      issue_type: complaintData.issue_type,
      identified_concern: complaintData.identified_concern,
      attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
      submitted_by_name: complaintData.submitted_by_name,
      submitted_by_email: complaintData.submitted_by_email,
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit complaint: ${error.message}`);
    }

    return { data: data as Complaint, error: null };
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return { data: null, error: error as Error };
  }
};

export const fetchComplaints = async (storeNumber?: string): Promise<{ data: Complaint[]; error: Error | null }> => {
  try {
    let query = supabase
      .from('complaints')
      .select('*')
      .order('date_submitted', { ascending: false });

    // Filter by store number if provided (for non-admin users)
    if (storeNumber) {
      query = query.eq('store_number', storeNumber);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch complaints: ${error.message}`);
    }

    return { data: data as Complaint[], error: null };
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return { data: [], error: error as Error };
  }
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: string,
  adminResponse?: string,
  adminResponder?: string
): Promise<{ data: Complaint | null; error: Error | null }> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminResponse) {
      updateData.admin_response = adminResponse;
    }

    if (adminResponder) {
      updateData.admin_responder = adminResponder;
    }

    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update complaint: ${error.message}`);
    }

    return { data: data as Complaint, error: null };
  } catch (error) {
    console.error('Error updating complaint:', error);
    return { data: null, error: error as Error };
  }
};
