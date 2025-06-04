
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface MessageIndicatorProps {
  messageCount: number;
  className?: string;
}

export function MessageIndicator({ messageCount, className = "" }: MessageIndicatorProps) {
  if (messageCount === 0) return null;

  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <MessageSquare className="h-3 w-3" />
      {messageCount}
    </Badge>
  );
}
