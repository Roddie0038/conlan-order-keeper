
import { Navigation } from "@/components/Navigation";
import { CrossDockPaperworkForm } from '@/components/order-form/CrossDockPaperworkForm';

export default function CrossDock() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <Navigation />
      <CrossDockPaperworkForm />
    </div>
  );
}
