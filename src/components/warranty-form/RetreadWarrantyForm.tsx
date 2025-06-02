
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRetreadWarrantyForm } from "@/hooks/useRetreadWarrantyForm";
import { useWarrantySubmission } from "@/hooks/useWarrantySubmission";
import { BasicFormFields } from "./BasicFormFields";
import { FileUploadFields } from "./FileUploadFields";
import { AcknowledgmentSection } from "./AcknowledgmentSection";

export default function RetreadWarrantyForm() {
  const {
    form,
    loading,
    setLoading,
    handleChange,
    handleFileChange,
    handleCheckbox,
    resetForm,
  } = useRetreadWarrantyForm();

  const { submitWarranty } = useWarrantySubmission();

  const handleSubmit = () => {
    submitWarranty(form, setLoading, resetForm);
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
        <BasicFormFields form={form} onChange={handleChange} />
        <FileUploadFields onFileChange={handleFileChange} />
        <AcknowledgmentSection 
          acknowledged={form.acknowledged}
          onCheckboxChange={handleCheckbox}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
}
