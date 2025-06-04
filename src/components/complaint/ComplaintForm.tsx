
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/inventory/FileUploader";
import { CreateComplaintData } from "@/types/complaint.types";
import { submitComplaint } from "@/services/complaintService";
import { extractStoreNumber } from "@/utils/storeUtils";
import { storeData } from "@/config/storeData";

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState<Partial<CreateComplaintData>>({
    store_number: user?.store ? extractStoreNumber(user.store) : '',
    store_name: user?.store || '',
    submitted_by_name: user?.name || '',
    submitted_by_email: user?.email || '',
    complaint_type: undefined,
    issue_type: undefined,
    identified_concern: '',
  });

  const handleInputChange = (field: keyof CreateComplaintData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStoreChange = (storeNumber: string) => {
    const store = storeData.find(s => s.storeNumber === storeNumber);
    if (store) {
      setFormData(prev => ({
        ...prev,
        store_number: storeNumber,
        store_name: store.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.complaint_type || !formData.issue_type || !formData.identified_concern?.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintData: CreateComplaintData = {
        store_number: formData.store_number!,
        store_name: formData.store_name!,
        sales_person: formData.sales_person,
        complaint_type: formData.complaint_type!,
        work_order_number: formData.work_order_number,
        order_id: formData.order_id,
        issue_type: formData.issue_type!,
        identified_concern: formData.identified_concern!,
        attachments: attachments.length > 0 ? attachments : undefined,
        submitted_by_name: formData.submitted_by_name!,
        submitted_by_email: formData.submitted_by_email!,
      };

      const { data, error } = await submitComplaint(complaintData);

      if (error) {
        throw error;
      }

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully and will be reviewed by our team.",
      });

      // Reset form
      setFormData({
        store_number: user?.store ? extractStoreNumber(user.store) : '',
        store_name: user?.store || '',
        submitted_by_name: user?.name || '',
        submitted_by_email: user?.email || '',
        complaint_type: undefined,
        issue_type: undefined,
        identified_concern: '',
      });
      setAttachments([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Complaint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="store">Store *</Label>
              {user?.isAdmin ? (
                <Select value={formData.store_number} onValueChange={handleStoreChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeData.map((store) => (
                      <SelectItem key={store.storeNumber} value={store.storeNumber}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={formData.store_name} disabled />
              )}
            </div>
            <div>
              <Label htmlFor="sales_person">Sales Person</Label>
              <Input
                id="sales_person"
                value={formData.sales_person || ''}
                onChange={(e) => handleInputChange('sales_person', e.target.value)}
                placeholder="Enter sales person name"
              />
            </div>
          </div>

          {/* Complaint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="complaint_type">Complaint Type *</Label>
              <Select 
                value={formData.complaint_type} 
                onValueChange={(value: 'Tire Transfer' | 'Retread' | 'Work Order') => 
                  handleInputChange('complaint_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tire Transfer">Tire Transfer</SelectItem>
                  <SelectItem value="Retread">Retread</SelectItem>
                  <SelectItem value="Work Order">Work Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="issue_type">Issue Type *</Label>
              <Select 
                value={formData.issue_type} 
                onValueChange={(value: 'Warehouse' | 'Retread') => 
                  handleInputChange('issue_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Retread">Retread</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work_order_number">Work Order Number</Label>
              <Input
                id="work_order_number"
                value={formData.work_order_number || ''}
                onChange={(e) => handleInputChange('work_order_number', e.target.value)}
                placeholder="Enter work order number"
              />
            </div>
            <div>
              <Label htmlFor="order_id">Order ID</Label>
              <Input
                id="order_id"
                value={formData.order_id || ''}
                onChange={(e) => handleInputChange('order_id', e.target.value)}
                placeholder="Enter order ID"
              />
            </div>
          </div>

          {/* Complaint Description */}
          <div>
            <Label htmlFor="identified_concern">Identified Concern *</Label>
            <Textarea
              id="identified_concern"
              value={formData.identified_concern || ''}
              onChange={(e) => handleInputChange('identified_concern', e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Attachments</Label>
            <FileUploader
              onFilesSelected={setAttachments}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
              }}
              maxFiles={5}
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
            {attachments.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {attachments.length} file(s) selected
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitted_by_name">Your Name *</Label>
              <Input
                id="submitted_by_name"
                value={formData.submitted_by_name || ''}
                onChange={(e) => handleInputChange('submitted_by_name', e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="submitted_by_email">Your Email *</Label>
              <Input
                id="submitted_by_email"
                type="email"
                value={formData.submitted_by_email || ''}
                onChange={(e) => handleInputChange('submitted_by_email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
