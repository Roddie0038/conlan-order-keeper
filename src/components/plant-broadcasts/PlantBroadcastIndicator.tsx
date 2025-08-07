import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { usePlantBroadcasts } from "@/hooks/usePlantBroadcasts";

interface PlantBroadcastIndicatorProps {
  className?: string;
  showIcon?: boolean;
}

export function PlantBroadcastIndicator({ 
  className = "", 
  showIcon = true 
}: PlantBroadcastIndicatorProps) {
  const { unreadCount } = usePlantBroadcasts();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-blue-100 text-blue-800 flex items-center gap-1 ${className}`}
    >
      {showIcon && <Globe className="h-3 w-3" />}
      {unreadCount} broadcast{unreadCount !== 1 ? 's' : ''}
    </Badge>
  );
}