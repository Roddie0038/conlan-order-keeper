
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapComplaintRow, ComplaintUI } from "@/lib/mappers";

export type Complaint = ComplaintUI;

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
      setComplaints((data || []).map(mapComplaintRow) as any);
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
        .eq('id', Number(complaintId));

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
