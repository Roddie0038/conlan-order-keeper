import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useRegionalMessages } from "@/hooks/useRegionalMessages";

interface RegionalMessageIndicatorProps {
  className?: string;
  showIcon?: boolean;
}

export function RegionalMessageIndicator({ 
  className = "", 
  showIcon = true 
}: RegionalMessageIndicatorProps) {
  const { unreadCount } = useRegionalMessages();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-blue-100 text-blue-800 flex items-center gap-1 ${className}`}
    >
      {showIcon && <Globe className="h-3 w-3" />}
      {unreadCount} regional
    </Badge>
  );
}