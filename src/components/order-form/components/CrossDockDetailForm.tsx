
import { useState } from "react";
import { FormData } from "../formConfig";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileInput, Printer, Calendar, Check } from "lucide-react";

interface CrossDockDetailFormProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const CrossDockDetailForm = ({ formData, onChange }: CrossDockDetailFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [confirmPaperwork, setConfirmPaperwork] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Update the form data with the file name
      onChange("crossDockFile" as keyof FormData, e.target.files[0].name);
    }
  };
  
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPaperwork(e.target.checked);
    // Update the form data with the confirmation status
    onChange("crossDockConfirmation" as keyof FormData, e.target.checked ? "yes" : "no");
  };
  
  const handlePrintForm = () => {
    console.log("Print Cross Dock Form:", formData);
    // Here we would implement the PDF generation and printing logic
    // This could use the same PDF generation utility we created for the main form
    window.alert("Cross Dock form would be printed now");
  };
  
  return (
    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <h4 className="text-lg font-medium mb-4 text-purple-700 dark:text-purple-300">Cross Dock Details</h4>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="transferWorkOrderNumber" className="block text-sm font-medium mb-1 text-black">
            Transfer Work Order Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="transferWorkOrderNumber"
            value={formData.transferWorkOrderNumber || ""}
            onChange={e => onChange("transferWorkOrderNumber" as keyof FormData, e.target.value)}
            placeholder="Enter work order number"
            className="w-full border border-gray-600 rounded-md h-10 bg-black/40 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm backdrop-blur-sm text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="trailerNumber" className="block text-sm font-medium mb-1 text-black">
            Trailer Number
          </Label>
          <Input
            id="trailerNumber"
            value={formData.trailerNumber || ""}
            onChange={e => onChange("trailerNumber" as keyof FormData, e.target.value)}
            placeholder="Enter trailer number (optional)"
            className="w-full border border-gray-600 rounded-md h-10 bg-black/40 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm backdrop-blur-sm text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="eta" className="block text-sm font-medium mb-1 text-black">
            ETA (Estimated Arrival) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="eta"
              type="date"
              value={formData.eta || ""}
              onChange={e => onChange("eta" as keyof FormData, e.target.value)}
              className="w-full border border-gray-600 rounded-md h-10 bg-black/40 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm backdrop-blur-sm text-white pl-10"
              required
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="fileUpload" className="block text-sm font-medium mb-1 text-black">
            File Upload (Optional)
          </Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-md">
            <div className="space-y-1 text-center">
              <FileInput className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="fileUpload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400"
                >
                  <span>Upload a file</span>
                  <input
                    id="fileUpload"
                    name="file"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1 text-black">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          </div>
          {file && (
            <p className="mt-2 text-sm text-black">
              Selected file: {file.name}
            </p>
          )}
        </div>
        
        <div className="flex items-center mt-4">
          <input
            id="confirmPaperwork"
            type="checkbox"
            checked={confirmPaperwork}
            onChange={handleConfirmChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            required
          />
          <label htmlFor="confirmPaperwork" className="ml-2 block text-sm text-black">
            I confirm paperwork is printed and attached <span className="text-red-500">*</span>
          </label>
        </div>
        
        <Button
          type="button"
          onClick={handlePrintForm}
          variant="outline"
          className="mt-4 flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Printer className="h-4 w-4" />
          <span>Print Cross Dock Form</span>
        </Button>
      </div>
    </div>
  );
};
