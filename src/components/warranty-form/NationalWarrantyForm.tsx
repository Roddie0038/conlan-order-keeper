
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNationalWarrantyForm } from "@/hooks/useNationalWarrantyForm";
import { VehicleInfoFields } from "./VehicleInfoFields";
import { NationalFormFields } from "./NationalFormFields";
import { SignatureUploadField } from "./SignatureUploadField";
import { FileUploadFields } from "./FileUploadFields";
import { useNationalWarrantySubmission } from "@/hooks/useNationalWarrantySubmission";
import { HelpBanner } from "./HelpBanner";

export function NationalWarrantyForm() {
  const { user } = useAuth();
  const { form, updateForm, resetForm } = useNationalWarrantyForm();
  const { submitWarranty } = useNationalWarrantySubmission();
  const [loading, setLoading] = useState(false);

  // Auto-fill store and manager information
  useEffect(() => {
    if (user) {
      updateForm("storeLocation", user.storeName || "");
      updateForm("managerName", user.name || "");
    }
  }, [user, updateForm]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    updateForm(field as keyof typeof form, value);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateForm("signatureFile", file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: "invoice" | "photos") => {
    if (type === "photos" && e.target.files) {
      const files = Array.from(e.target.files);
      updateForm("photoFiles", files);
    }
  };

  const handleSubmit = async () => {
    await submitWarranty(form, setLoading, resetForm);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black">
          <CardTitle className="text-2xl font-bold text-center">
            National Account Warranty Tire Submission
          </CardTitle>
          <CardDescription className="text-center text-black/80 font-medium">
            Submit warranty claims for National Account tires. Claims will be reviewed by the Continental Rep team.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 bg-white/95">
          {/* Construction Warning */}
          <Alert className="border-amber-500 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-semibold">⚠️ Page Under Construction</AlertTitle>
            <AlertDescription>
              This warranty submission form is still in development and is not yet functional.<br />
              <strong>ETA for completion:</strong> 1 week.<br />
              Please do not submit any warranty tires at this time.
            </AlertDescription>
          </Alert>

          <HelpBanner 
            title="Unsure how to complete this form?"
            description="View our comprehensive step-by-step guide for the National Account Warranty Form."
            guideUrl="/lovable-uploads/9f63f643-3350-4807-90cc-f786a584cf45.png"
          />

          {/* Store Information (Auto-filled) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeLocation">Store Location</Label>
              <Input
                id="storeLocation"
                value={form.storeLocation}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="managerName">Manager Name</Label>
              <Input
                id="managerName"
                value={form.managerName}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={(e) => handleFieldChange("customerName", e.target.value)}
                placeholder="Customer's full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="workOrder">Work Order # *</Label>
              <Input
                id="workOrder"
                value={form.workOrder}
                onChange={(e) => handleFieldChange("workOrder", e.target.value)}
                placeholder="Work order number"
                required
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VehicleInfoFields
              vehicleMake={form.vehicleMake}
              vinOrUnit={form.vinOrUnit}
              modelYear={form.modelYear}
              purchaseDate={form.purchaseDate}
              wheelPosition={form.wheelPosition}
              onFieldChange={handleFieldChange}
            />
          </div>

          {/* Tire Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NationalFormFields
              dotNumber={form.dotNumber}
              tireSize={form.tireSize}
              loadRange={form.loadRange}
              wearPercentage={form.wearPercentage}
              mileageOnTire={form.mileageOnTire}
              reasonForAdjustment={form.reasonForAdjustment}
              exciseTaxCollected={form.exciseTaxCollected}
              replacementProductCode={form.replacementProductCode}
              notes={form.notes}
              onFieldChange={handleFieldChange}
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignatureUploadField onFileChange={handleSignatureChange} />
            <FileUploadFields onFileChange={handlePhotoChange} />
          </div>

          {/* Acknowledgment */}
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <Checkbox
              id="acknowledged"
              checked={form.acknowledged}
              onCheckedChange={(checked) => handleFieldChange("acknowledged", checked as boolean)}
            />
            <Label htmlFor="acknowledged" className="text-sm font-medium">
              I will not dispose of the tire until authorized by the Continental Rep. *
            </Label>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={loading || !form.acknowledged}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold border-2 border-black/20"
            size="lg"
          >
            {loading ? "Submitting..." : "Submit National Account Warranty Claim"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
