
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignatureUploadFieldProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SignatureUploadField({ onFileChange }: SignatureUploadFieldProps) {
  return (
    <div>
      <Label htmlFor="signatureFile">Customer Signature *</Label>
      <Input
        id="signatureFile"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={onFileChange}
        required
      />
      <p className="text-sm text-muted-foreground mt-1">
        Upload PDF or image file of customer signature
      </p>
    </div>
  );
}
