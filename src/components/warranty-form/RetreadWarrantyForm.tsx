
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRetreadWarrantyForm } from "@/hooks/useRetreadWarrantyForm";
import { useWarrantySubmission } from "@/hooks/useWarrantySubmission";
import { BasicFormFields } from "./BasicFormFields";
import { FileUploadFields } from "./FileUploadFields";
import { AcknowledgmentSection } from "./AcknowledgmentSection";
import { HelpBanner } from "./HelpBanner";
import { EmailRecipientsPreview } from "@/components/shared/EmailRecipientsPreview";
import { useState } from "react";

export default function RetreadWarrantyForm() {
  const {
    form,
    loading,
    setLoading,
    errors,
    setErrors,
    handleChange,
    handleFileChange,
    handleCheckbox,
    resetForm,
  } = useRetreadWarrantyForm();

  const [recipientCount, setRecipientCount] = useState(0);

  const { submitWarranty } = useWarrantySubmission();

  const handleSubmit = () => {
    submitWarranty(form, setLoading, resetForm, setErrors);
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black">
        <CardTitle className="text-2xl font-bold text-center">
          Retread Warranty Submission (Local Book)
        </CardTitle>
        <p className="text-center text-black/80 font-medium">
          Submit warranty claims for retreaded tires handled under the Local Book process
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 bg-white/95">
        <HelpBanner 
          title="Need help filling out this form?"
          description="View our step-by-step guide to complete the Local Retread Warranty Form correctly."
          guideUrl="/lovable-uploads/6bf42604-5925-4802-bdef-1c34ebff45f3.png"
        />
        
        <BasicFormFields form={form} onChange={handleChange} errors={errors} />
        <FileUploadFields 
          onFileChange={(e, type) => {
            const files = e.target.files;
            if (type === "invoice") {
              handleFileChange("invoiceFile", files ? files[0] : null);
            } else if (type === "photos") {
              handleFileChange("photoFiles", files ? Array.from(files) : null);
            }
          }}
        />
        
        {/* Email Recipients Preview */}
        {form.destinationPlant && (
          <div className="mt-6">
            <EmailRecipientsPreview
              store="Warranty Department"
              plant={form.destinationPlant}
              emailType="warranty"
              orderData={{
                email: "warranty@conlantire.com"
              }}
              className="w-full"
              onRecipientsChange={setRecipientCount}
            />
          </div>
        )}
        
        <AcknowledgmentSection 
          acknowledged={form.acknowledged}
          onCheckboxChange={handleCheckbox}
          loading={loading}
          onSubmit={handleSubmit}
          recipientCount={recipientCount}
        />
      </CardContent>
    </Card>
  );
}
