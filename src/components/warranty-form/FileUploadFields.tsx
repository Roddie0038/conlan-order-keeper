
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadFieldsProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "invoice" | "photos") => void;
}

export function FileUploadFields({ onFileChange }: FileUploadFieldsProps) {
  return (
    <>
      {/* Invoice Upload */}
      <div>
        <Label htmlFor="invoiceFile">MaddenCo Sales Invoice</Label>
        <Input
          id="invoiceFile"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => onFileChange(e, "invoice")}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Upload PDF or image file of the sales invoice (optional)
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
          onChange={(e) => onFileChange(e, "photos")}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Upload photos showing tire damage (optional, multiple files allowed)
        </p>
      </div>
    </>
  );
}
