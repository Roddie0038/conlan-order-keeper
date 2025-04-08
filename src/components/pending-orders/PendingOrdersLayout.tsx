
import { ReactNode } from "react";

interface PendingOrdersLayoutProps {
  children: ReactNode;
}

export function PendingOrdersLayout({ children }: PendingOrdersLayoutProps) {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative" 
      style={{
        backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {children}
    </div>
  );
}
