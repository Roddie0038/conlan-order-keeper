
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Complaint } from "@/hooks/useFetchComplaints";
import { CalendarDays, User, Mail, Phone, FileText, MessageSquare } from "lucide-react";

interface ComplaintDetailModalProps {
  open: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onUpdateStatus: (complaintId: string, status: string, adminResponse?: string, adminResponder?: string) => Promise<boolean>;
}

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

export function ComplaintDetailModal({ open, onClose, complaint, onUpdateStatus }: ComplaintDetailModalProps) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!complaint) return null;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setIsUpdating(true);
    const success = await onUpdateStatus(
      complaint.id, 
      selectedStatus, 
      adminResponse || undefined,
      user?.name || undefined
    );
    
    if (success) {
      setSelectedStatus('');
      setAdminResponse('');
      onClose();
    }
    setIsUpdating(false);
  };

  const isAdmin = user?.isAdmin;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Complaint Details - {complaint.complaint_type}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Complaint Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Complaint Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Submitted: {new Date(complaint.date_submitted).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Store:</span>
                  <p className="text-sm">{complaint.store_name} (#{complaint.store_number})</p>
                </div>

                <div>
                  <span className="font-medium">Issue Type:</span>
                  <p className="text-sm">{complaint.issue_type}</p>
                </div>

                {complaint.work_order_number && (
                  <div>
                    <span className="font-medium">Work Order:</span>
                    <p className="text-sm">{complaint.work_order_number}</p>
                  </div>
                )}

                {complaint.order_id && (
                  <div>
                    <span className="font-medium">Order ID:</span>
                    <p className="text-sm">{complaint.order_id}</p>
                  </div>
                )}

                {complaint.sales_person && (
                  <div>
                    <span className="font-medium">Sales Person:</span>
                    <p className="text-sm">{complaint.sales_person}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Submitter Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{complaint.submitted_by_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{complaint.submitted_by_email}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Complaint Details</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {complaint.identified_concern}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Attachments & Admin Response */}
          <div className="space-y-6">
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attachments ({complaint.attachments.length})
                </h4>
                <div className="space-y-2">
                  {complaint.attachments.map((url, index) => (
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

            {complaint.admin_response && (
              <div>
                <h4 className="font-semibold mb-2">Admin Response</h4>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {complaint.admin_response}
                  </p>
                  {complaint.admin_responder && (
                    <p className="text-xs text-gray-600 mt-2">
                      - {complaint.admin_responder}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Admin Actions</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Update Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="response">Admin Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Add your response to this complaint..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? "Updating..." : "Update Complaint"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
