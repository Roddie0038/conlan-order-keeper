
import { DocumentFormContent } from "./document-form/DocumentFormContent";

interface DocumentFormProps {
  onFormSubmitted?: () => void;
}

export function DocumentForm({ onFormSubmitted }: DocumentFormProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
      <DocumentFormContent onFormSubmitted={onFormSubmitted} />
    </div>
  );
}
