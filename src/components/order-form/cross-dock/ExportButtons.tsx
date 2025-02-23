
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonsProps {
  onExport: (type: 'excel' | 'pdf') => void;
}

export const ExportButtons = ({ onExport }: ExportButtonsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => onExport('excel')}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onExport('pdf')}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export PDF
      </Button>
      <Button
        type="submit"
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Submit Paperwork
      </Button>
    </div>
  );
};
