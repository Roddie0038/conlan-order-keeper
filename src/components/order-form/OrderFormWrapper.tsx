
import { ReactNode } from "react";

interface OrderFormWrapperProps {
  children: ReactNode;
}

export function OrderFormWrapper({ children }: OrderFormWrapperProps) {
  return (
    <div className="space-y-6 bg-white shadow-xl p-8 rounded-2xl border border-gray-200">
      {children}
    </div>
  );
}
