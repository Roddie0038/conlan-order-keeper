import { TireSpinner } from "../ui/tire-spinner";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <TireSpinner size="lg" />
        <p className="text-lg font-medium">Submitting Orders...</p>
      </div>
    </div>
  );
};