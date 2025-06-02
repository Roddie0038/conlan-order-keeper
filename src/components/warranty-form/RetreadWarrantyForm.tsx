
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { uploadFileToSupabase, uploadMultipleFiles } from "@/services/storageService";
import { submitRetreadWarranty } from "@/services/warrantyService";
import { useToast } from "@/components/ui/use-toast";

export default function RetreadWarrantyForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    workOrder: "",
    dotNumber: "",
    tireSize: "",
    condition: "",
    notes: "",
    invoiceFile: null as File | null,
    photoFiles: [] as File[],
    acknowledged: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "invoice" | "photos") => {
    if (type === "invoice") {
      setForm({ ...form, invoiceFile: e.target.files?.[0] || null });
    } else {
      setForm({ ...form, photoFiles: Array.from(e.target.files || []) });
    }
  };

  const handleCheckbox = (checked: boolean) => {
    setForm({ ...form, acknowledged: checked });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.acknowledged) {
      toast({ 
        variant: "destructive", 
        title: "Acknowledgment Required",
        description: "Please acknowledge credit terms before submitting." 
      });
      return;
    }
    
    if (!form.customerName || !form.workOrder || !form.dotNumber || !form.condition || !form.invoiceFile) {
      toast({ 
        variant: "destructive", 
        title: "Missing Required Fields",
        description: "Please fill all required fields including invoice upload." 
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Starting warranty claim submission...");
      
      // Upload invoice file
      const invoiceUrl = await uploadFileToSupabase(
        form.invoiceFile, 
        "warranty-docs", 
        user?.id
      );
      
      // Upload photo files if any
      const photoUrls = form.photoFiles.length > 0 
        ? await uploadMultipleFiles(form.photoFiles, "warranty-photos", user?.id)
        : [];

      // Submit warranty claim
      await submitRetreadWarranty({
        user_id: user?.id,
        plant: user?.plant || "Grand Prairie 97",
        store: user?.storeName || "",
        tire_type: "Retread",
        dot_number: form.dotNumber,
        condition: form.condition,
        notes: form.notes,
        customer_name: form.customerName,
        work_order: form.workOrder,
        tire_size: form.tireSize,
        invoice_url: invoiceUrl,
        photo_urls: photoUrls,
        email: user?.email || "",
        name: user?.username || "",
      });

      toast({ 
        title: "Success!",
        description: "Warranty claim submitted. You will be notified once credit is processed." 
      });
      
      // Reset form
      setForm({
        customerName: "",
        workOrder: "",
        dotNumber: "",
        tireSize: "",
        condition: "",
        notes: "",
        invoiceFile: null,
        photoFiles: [],
        acknowledged: false,
      });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      console.error("❌ Warranty submission error:", error);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed",
        description: "Error submitting warranty claim. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Retread Warranty Submission (Local Book)
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Submit warranty claims for retreaded tires handled under the Local Book process
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Store Location - Auto-filled */}
        <div>
          <Label htmlFor="storeLocation">Store Location</Label>
          <Input 
            id="storeLocation"
            value={user?.storeName || "Not specified"}
            disabled 
            className="bg-gray-50"
          />
        </div>

        {/* Customer Name */}
        <div>
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>

        {/* Work Order */}
        <div>
          <Label htmlFor="workOrder">Retread Work Order # *</Label>
          <Input
            id="workOrder"
            name="workOrder"
            value={form.workOrder}
            onChange={handleChange}
            placeholder="Enter work order number"
            required
          />
        </div>

        {/* DOT Number */}
        <div>
          <Label htmlFor="dotNumber">DOT Number *</Label>
          <Input
            id="dotNumber"
            name="dotNumber"
            value={form.dotNumber}
            onChange={handleChange}
            placeholder="Enter DOT number"
            required
          />
        </div>

        {/* Tire Size */}
        <div>
          <Label htmlFor="tireSize">Tire Size</Label>
          <Input
            id="tireSize"
            name="tireSize"
            value={form.tireSize}
            onChange={handleChange}
            placeholder="Enter tire size (optional)"
          />
        </div>

        {/* Condition */}
        <div>
          <Label htmlFor="condition">Tire Condition / Reason for Adjustment *</Label>
          <Textarea
            id="condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            placeholder="Describe the tire condition and reason for warranty claim"
            rows={3}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional information (optional)"
            rows={2}
          />
        </div>

        {/* Invoice Upload */}
        <div>
          <Label htmlFor="invoiceFile">MaddenCo Sales Invoice *</Label>
          <Input
            id="invoiceFile"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => handleFileChange(e, "invoice")}
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload PDF or image file of the sales invoice
          </p>
        </div>

        {/* Photo Upload */}
        <div>
          <Label htmlFor="photoFiles">Photo of Tire Damage</Label>
          <Input
            id="photoFiles"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileChange(e, "photos")}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload photos showing tire damage (optional, multiple files allowed)
          </p>
        </div>

        {/* Acknowledgment */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acknowledged"
            checked={form.acknowledged}
            onCheckedChange={handleCheckbox}
          />
          <Label htmlFor="acknowledged" className="text-sm">
            I understand credit is issued after plant approval (up to 2 weeks) *
          </Label>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={loading || !form.acknowledged}
          className="w-full"
          size="lg"
        >
          {loading ? "Submitting..." : "Submit Warranty Claim"}
        </Button>
      </CardContent>
    </Card>
  );
}
