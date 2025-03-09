
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportAllOrderData, exportToCSV, prepareOrderDataForExport } from "@/utils/exportUtils";

interface ExportButtonProps {
  data?: any[];
  filename?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  exportAll?: boolean;
  className?: string;
}

export const ExportButton = ({
  data,
  filename = "exported-data",
  variant = "outline",
  size = "sm",
  exportAll = false,
  className = ""
}: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      if (exportAll) {
        // Export all order types
        const result = exportAllOrderData();
        if (result.success) {
          toast({
            title: "Export Successful",
            description: `Exported ${result.counts?.regular || 0} regular orders and ${result.counts?.mto || 0} MTO orders.`,
          });
        } else {
          toast({
            title: "Export Failed",
            description: result.message,
            variant: "destructive"
          });
        }
      } else if (data && data.length > 0) {
        // Export specific data set
        const preparedData = prepareOrderDataForExport(data);
        exportToCSV(preparedData, filename);
        toast({
          title: "Export Successful",
          description: `Exported ${data.length} items to ${filename}.csv`
        });
      } else {
        toast({
          title: "Nothing to Export",
          description: "No data available to export.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download size={16} />
      Export CSV
    </Button>
  );
};
