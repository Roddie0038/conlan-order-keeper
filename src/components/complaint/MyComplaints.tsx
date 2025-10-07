
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, CalendarDays, Eye, FileText } from "lucide-react";
import { Complaint } from "@/hooks/useFetchComplaints";
import { mapComplaintRow } from "@/lib/mappers";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-red-500 hover:bg-red-600';
    case 'in progress':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'resolved':
      return 'bg-green-500 hover:bg-green-600';
    case 'closed':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

export function MyComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Extract store number from user store name
  const getStoreNumber = (storeName: string): string => {
    const match = storeName.match(/(\d+)/);
    return match ? match[1] : '';
  };

  const fetchMyComplaints = async () => {
    if (!user?.storeName) return;

    try {
      setLoading(true);
      const storeNumber = getStoreNumber(user.storeName);
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('store_number', storeNumber)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching my complaints:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your complaints",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ Fetched ${data?.length || 0} complaints for store ${storeNumber}`);
      setComplaints((data || []).map(mapComplaintRow) as any);
    } catch (error) {
      console.error('❌ Fetch my complaints error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your complaints",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading your complaints...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Complaints ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No complaints submitted yet</p>
              <p className="text-sm mt-2">When you submit complaints, they will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{complaint.complaint_type}</h3>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{complaint.issue_type}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(complaint.date_submitted).toLocaleDateString()}
                        </div>
                        {complaint.work_order_number && (
                          <span>WO: {complaint.work_order_number}</span>
                        )}
                        {complaint.attachments && complaint.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {complaint.attachments.length} attachment(s)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedComplaint(complaint)}
                      className="ml-4"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Detail Modal (Read-only for stores) */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Complaint Details - {selectedComplaint?.complaint_type}
            </DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Submitted: {new Date(selectedComplaint.date_submitted).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Issue Details</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> {selectedComplaint.issue_type}</p>
                  {selectedComplaint.work_order_number && (
                    <p><span className="font-medium">Work Order:</span> {selectedComplaint.work_order_number}</p>
                  )}
                  {selectedComplaint.order_id && (
                    <p><span className="font-medium">Order ID:</span> {selectedComplaint.order_id}</p>
                  )}
                  {selectedComplaint.sales_person && (
                    <p><span className="font-medium">Sales Person:</span> {selectedComplaint.sales_person}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedComplaint.identified_concern}
                  </p>
                </div>
              </div>

              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Attachments ({selectedComplaint.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedComplaint.attachments.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Attachment {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.admin_response && (
                <div>
                  <h4 className="font-semibold mb-2">Admin Response</h4>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedComplaint.admin_response}
                    </p>
                    {selectedComplaint.admin_responder && (
                      <p className="text-xs text-gray-600 mt-2">
                        - {selectedComplaint.admin_responder}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
