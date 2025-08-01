
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStatefulFormAutosave } from "@/hooks/useFormAutosave";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultipleFileUploader } from "./MultipleFileUploader";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";
import { uploadMultipleFiles } from "@/services/storageService";
import { supabase } from "@/integrations/supabase/client";
import { getComplaintNotificationRecipients } from "@/services/managerService";

interface ComplaintFormData {
  complaintType: string;
  issueType: string;
  workOrderNumber: string;
  orderId: string;
  identifiedConcern: string;
  salesPerson: string;
  attachments: File[];
  destinationPlant: string;
}

const COMPLAINT_TYPES = [{
  value: "Tire Transfer",
  label: "Tire Transfer"
}, {
  value: "Retread",
  label: "Retread"
}, {
  value: "Work Order",
  label: "Work Order"
}];

const ISSUE_TYPES = [{
  value: "Warehouse",
  label: "Warehouse"
}, {
  value: "Retread",
  label: "Retread"
}];

export function ComplaintForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ComplaintFormData>({
    complaintType: "",
    issueType: "",
    workOrderNumber: "",
    orderId: "",
    identifiedConcern: "",
    salesPerson: "",
    attachments: [],
    destinationPlant: ""
  });
  const [errors, setErrors] = useState<Partial<ComplaintFormData>>({});

  // Auto-save functionality (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData, saveNow } = useStatefulFormAutosave(
    formData,
    setFormData,
    'complaint',
    {
      enabled: !user?.isAdmin,
      excludeFields: ['attachments'], // Exclude file objects from persistence
      onRestore: () => {
        console.log('🔄 Complaint form data restored');
      }
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ComplaintFormData> = {};
    if (!formData.complaintType) {
      newErrors.complaintType = "Complaint type is required";
    }
    if (!formData.issueType) {
      newErrors.issueType = "Issue type is required";
    }
    if (!formData.identifiedConcern.trim()) {
      newErrors.identifiedConcern = "Identified concern is required";
    }
    if (!formData.destinationPlant) {
      newErrors.destinationPlant = "Please select a destination plant";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit a complaint"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("🚀 Starting complaint submission for plant:", formData.destinationPlant);

      // Upload attachments if any
      let attachmentUrls: string[] = [];
      if (formData.attachments.length > 0) {
        console.log(`📎 Uploading ${formData.attachments.length} attachments...`);
        attachmentUrls = await uploadMultipleFiles(formData.attachments, "complaint-attachments", user.id);
        console.log("✅ Attachments uploaded:", attachmentUrls);
      }

      const storeNumber = user.store.match(/\d+/)?.[0] || "22";

      // Submit complaint to database
      console.log("💾 Inserting complaint into database...");
      const { data: complaintData, error: insertError } = await supabase
        .from('complaints')
        .insert({
          store_number: storeNumber,
          store_name: user.storeName,
          sales_person: formData.salesPerson || null,
          complaint_type: formData.complaintType,
          work_order_number: formData.workOrderNumber || null,
          order_id: formData.orderId || null,
          issue_type: formData.issueType,
          identified_concern: formData.identifiedConcern,
          attachments: attachmentUrls,
          status: 'Open',
          submitted_by_name: user.name,
          submitted_by_email: user.email,
          date_submitted: new Date().toISOString(),
          notes: JSON.stringify([{
            plant: formData.destinationPlant,
            timestamp: new Date().toISOString(),
            note: `Complaint submitted for plant: ${formData.destinationPlant}`
          }])
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Database insertion error:", insertError);
        throw insertError;
      }
      console.log("✅ Complaint inserted successfully:", complaintData.id);

      // Get notification recipients
      const recipients = await getComplaintNotificationRecipients(storeNumber, user.email);

      // Send email notification
      console.log("📧 Sending email notification...");
      const { error: emailError } = await supabase.functions.invoke('complaint-notification', {
        body: {
          complaint: complaintData,
          recipients: recipients,
          attachmentUrls: attachmentUrls,
          destinationPlant: formData.destinationPlant
        }
      });

      if (emailError) {
        console.error("❌ Email notification error:", emailError);
      } else {
        console.log("✅ Email notification sent successfully");
      }

      toast({
        title: "Complaint Submitted Successfully",
        description: `Your complaint has been submitted for ${formData.destinationPlant} and the appropriate managers have been notified.`
      });

      // Clear auto-saved data and reset form
      clearPersistedData();
      setFormData({
        complaintType: "",
        issueType: "",
        workOrderNumber: "",
        orderId: "",
        identifiedConcern: "",
        salesPerson: "",
        attachments: [],
        destinationPlant: ""
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Complaint submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your complaint. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ComplaintFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Trigger immediate save for critical fields
    if (['complaintType', 'issueType', 'identifiedConcern'].includes(field)) {
      setTimeout(saveNow, 100); // Debounced manual save
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-600">You must be logged in to submit a complaint.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!user?.isAdmin && (
        <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
      )}
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Customer Complaint Form</CardTitle>
            <CardDescription>
              Submit a complaint regarding tire transfers, retreads, or work orders. All required fields must be completed.
            </CardDescription>
          </div>
          {!user?.isAdmin && (
            <ClearFormButton 
              onClear={() => {
                clearPersistedData();
                setFormData({
                  complaintType: "",
                  issueType: "",
                  workOrderNumber: "",
                  orderId: "",
                  identifiedConcern: "",
                  salesPerson: "",
                  attachments: [],
                  destinationPlant: ""
                });
                setErrors({});
              }}
              lastSaved={lastSaved}
              disabled={isRestoring}
            />
          )}
        </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-700">Store Information</Label>
              <p className="text-sm font-semibold">{user.storeName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Submitted By</Label>
              <p className="text-sm">{user.name} ({user.email})</p>
            </div>
          </div>

          {/* Mandatory Plant Selector */}
          <MandatoryPlantSelector
            value={formData.destinationPlant}
            onChange={(value) => updateFormData('destinationPlant', value)}
            error={errors.destinationPlant}
          />

          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="complaintType">Complaint Type *</Label>
              <Select value={formData.complaintType} onValueChange={value => updateFormData('complaintType', value)}>
                <SelectTrigger className={errors.complaintType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select complaint type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.complaintType && <p className="text-sm text-red-500">{errors.complaintType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type *</Label>
              <Select value={formData.issueType} onValueChange={value => updateFormData('issueType', value)}>
                <SelectTrigger className={errors.issueType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.issueType && <p className="text-sm text-red-500">{errors.issueType}</p>}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workOrderNumber">Work Order Number (MaddenCo)</Label>
              <Input 
                id="workOrderNumber" 
                value={formData.workOrderNumber} 
                onChange={e => updateFormData('workOrderNumber', e.target.value)} 
                placeholder="Enter work order number" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input 
                id="orderId" 
                value={formData.orderId} 
                onChange={e => updateFormData('orderId', e.target.value)} 
                placeholder="Enter order ID" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesPerson">Sales Person</Label>
              <Input 
                id="salesPerson" 
                value={formData.salesPerson} 
                onChange={e => updateFormData('salesPerson', e.target.value)} 
                placeholder="Enter sales person name" 
              />
            </div>
          </div>

          {/* Identified Concern */}
          <div className="space-y-2">
            <Label htmlFor="identifiedConcern">Identified Concern *</Label>
            <Textarea 
              id="identifiedConcern" 
              value={formData.identifiedConcern} 
              onChange={e => updateFormData('identifiedConcern', e.target.value)} 
              placeholder="Please describe the concern in detail..." 
              rows={4} 
              className={errors.identifiedConcern ? "border-red-500" : ""} 
            />
            {errors.identifiedConcern && <p className="text-sm text-red-500">{errors.identifiedConcern}</p>}
          </div>

          {/* File Attachments */}
          <MultipleFileUploader 
            value={formData.attachments} 
            onChange={files => updateFormData('attachments', files)} 
            maxFiles={10} 
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="submit" disabled={isSubmitting} className="px-8 py-2">
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
