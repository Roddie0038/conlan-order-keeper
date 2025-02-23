
import { Navigation } from "@/components/Navigation";
import { CrossDockPaperworkForm } from '@/components/order-form/CrossDockPaperworkForm';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CrossDock() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <Navigation />
      
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6 bg-yellow-100/90 dark:bg-yellow-900/90 border-yellow-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-bold">Page Under Construction</AlertTitle>
          <AlertDescription className="text-sm">
            We are currently making improvements to this page. Some features may be temporarily unavailable.
          </AlertDescription>
        </Alert>
      </div>

      <CrossDockPaperworkForm />
    </div>
  );
}
