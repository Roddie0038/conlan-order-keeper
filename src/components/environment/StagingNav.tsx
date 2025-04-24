
import { isStaging } from "@/config/environment";
import { Link } from "react-router-dom";

export function StagingNav() {
  // Only show in staging environment
  if (!isStaging) return null;
  
  return (
    <div className="fixed left-4 bottom-4 z-50">
      <Link
        to="/staging"
        className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow-md transition-colors"
      >
        Staging Dashboard
      </Link>
    </div>
  );
}
