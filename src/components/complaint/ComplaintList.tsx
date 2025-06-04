
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Complaint } from "@/types/complaint.types";
import { fetchComplaints, updateComplaintStatus } from "@/services/complaintService";
import { extractStoreNumber } from "@/utils/storeUtils";
import { useToast } from "@/hooks/use-toast";

export function ComplaintList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const storeNumber = user?.isAdmin ? undefined : extractStoreNumber(user?.store || '');
      const { data, error } = await fetchComplaints(storeNumber);
      
      if (error) {
        throw error;
      }
      
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast({
        title: "Error Loading Complaints",
        description: "Failed to load complaints. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    setUpdating(complaintId);
    try {
      const { error } = await updateComplaintStatus(
        complaintId,
        newStatus,
        adminResponse[complaintId] || undefined,
        user?.name || undefined
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Status Updated",
        description: "Complaint status has been updated successfully.",
      });

      // Reload complaints to get updated data
      await loadComplaints();
      
      // Clear admin response for this complaint
      setAdminResponse(prev => {
        const newState = { ...prev };
        delete newState[complaintId];
        return newState;
      });
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
            <p className="text-gray-600">No complaints have been submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        complaints.map((complaint) => (
          <Card key={complaint.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {complaint.complaint_type} - {complaint.issue_type}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Submitted by {complaint.submitted_by_name} from {complaint.store_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.date_submitted).toLocaleDateString()} at{' '}
                    {new Date(complaint.date_submitted).toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reference Numbers */}
              {(complaint.work_order_number || complaint.order_id) && (
                <div className="flex gap-4 text-sm">
                  {complaint.work_order_number && (
                    <span><strong>Work Order:</strong> {complaint.work_order_number}</span>
                  )}
                  {complaint.order_id && (
                    <span><strong>Order ID:</strong> {complaint.order_id}</span>
                  )}
                </div>
              )}

              {/* Sales Person */}
              {complaint.sales_person && (
                <div className="text-sm">
                  <strong>Sales Person:</strong> {complaint.sales_person}
                </div>
              )}

              {/* Complaint Description */}
              <div>
                <h4 className="font-medium mb-2">Identified Concern:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{complaint.identified_concern}</p>
              </div>

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {complaint.attachments.map((url, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Attachment {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {complaint.admin_response && (
                <div>
                  <h4 className="font-medium mb-2">Admin Response:</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    {complaint.admin_response}
                  </p>
                  {complaint.admin_responder && (
                    <p className="text-xs text-gray-500 mt-1">
                      Response by: {complaint.admin_responder}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Controls */}
              {user?.isAdmin && complaint.status !== 'Closed' && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Response:</label>
                    <Textarea
                      value={adminResponse[complaint.id] || ''}
                      onChange={(e) => setAdminResponse(prev => ({
                        ...prev,
                        [complaint.id]: e.target.value
                      }))}
                      placeholder="Enter response to the customer..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      onValueChange={(value) => handleStatusUpdate(complaint.id, value)}
                      disabled={updating === complaint.id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">Mark In Progress</SelectItem>
                        <SelectItem value="Resolved">Mark Resolved</SelectItem>
                        <SelectItem value="Closed">Close Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                    {updating === complaint.id && (
                      <Loader2 className="h-4 w-4 animate-spin mt-2" />
                    )}
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {complaint.resolved_at && (
                <div className="text-xs text-gray-500 border-t pt-2">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleDateString()} at{' '}
                  {new Date(complaint.resolved_at).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
