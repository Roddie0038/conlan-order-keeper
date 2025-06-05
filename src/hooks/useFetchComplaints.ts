
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Complaint {
  id: string;
  store_number: string;
  store_name: string;
  complaint_type: string;
  issue_type: string;
  work_order_number?: string;
  order_id?: string;
  identified_concern: string;
  submitted_by_name: string;
  submitted_by_email: string;
  sales_person?: string;
  status: string;
  admin_response?: string;
  admin_responder?: string;
  attachments?: string[];
  date_submitted: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export function useFetchComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching complaints:', error);
        toast({
          title: "Error",
          description: "Failed to fetch complaints",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ Fetched ${data?.length || 0} complaints`);
      setComplaints(data || []);
    } catch (error) {
      console.error('❌ Fetch complaints error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshComplaints = () => {
    fetchComplaints();
  };

  const updateComplaintStatus = async (complaintId: string, status: string, adminResponse?: string, adminResponder?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
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

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (error) {
        console.error('❌ Error updating complaint:', error);
        toast({
          title: "Error",
          description: "Failed to update complaint",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Complaint updated successfully"
      });
      
      fetchComplaints(); // Refresh the list
      return true;
    } catch (error) {
      console.error('❌ Update complaint error:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return {
    complaints,
    loading,
    refreshComplaints,
    updateComplaintStatus
  };
}
