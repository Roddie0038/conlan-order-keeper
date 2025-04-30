
import { Truck } from "lucide-react";

export function CrossDockHeader() {
  return (
    <div className="flex items-center space-x-2 mb-6 border-l-4 border-purple-500 pl-3">
      <Truck className="h-5 w-5 text-purple-500" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cross Dock Options</h3>
    </div>
  );
}
