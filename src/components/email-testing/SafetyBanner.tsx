
import { AlertTriangle } from "lucide-react";

export function SafetyBanner() {
  return (
    <div className="bg-yellow-500 border-2 border-yellow-600 rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-900" />
        <span className="text-yellow-900 font-bold text-lg">
          ⚠️ This module is for internal email testing only. No external emails will be sent.
        </span>
        <AlertTriangle className="h-6 w-6 text-yellow-900" />
      </div>
    </div>
  );
}
