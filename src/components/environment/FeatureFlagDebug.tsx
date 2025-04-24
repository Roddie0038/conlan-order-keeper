
import { featureFlags } from "@/config/featureFlags";
import { isStaging } from "@/config/environment";

export function FeatureFlagDebug() {
  // Only show in staging environment
  if (!isStaging) return null;
  
  return (
    <div className="fixed top-20 right-4 bg-slate-900 text-white p-4 rounded-md shadow-lg z-50 max-w-xs opacity-80 hover:opacity-100 transition-opacity">
      <h3 className="text-lg font-bold mb-2">Feature Flags</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(featureFlags).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span>{key}:</span>
            <span className={value ? "text-green-400" : "text-red-400"}>
              {value ? "Enabled" : "Disabled"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-gray-400">
        Add ?features=featureName,anotherFeature to URL to override
      </div>
    </div>
  );
}
