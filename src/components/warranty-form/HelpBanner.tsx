
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink } from "lucide-react";

interface HelpBannerProps {
  title: string;
  description: string;
  guideUrl: string;
}

export function HelpBanner({ title, description, guideUrl }: HelpBannerProps) {
  const handleGuideClick = () => {
    window.open(guideUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-blue-800 dark:text-blue-200">{title}</span>
          <span className="text-blue-700 dark:text-blue-300 text-sm">{description}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGuideClick}
          className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          View Guide
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
