
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

interface VersionBadgeProps {
  version?: string;
  lastUpdated: string;
  isNew?: boolean;
}

export function VersionBadge({ version, lastUpdated, isNew }: VersionBadgeProps) {
  const isRecentlyUpdated = () => {
    const updateDate = new Date(lastUpdated);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return updateDate > thirtyDaysAgo;
  };

  return (
    <div className="flex items-center gap-2">
      {version && (
        <Badge variant="outline" className="text-xs">
          v{version}
        </Badge>
      )}
      {(isNew || isRecentlyUpdated()) && (
        <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
          <Star className="h-3 w-3 mr-1" />
          {isNew ? 'New' : 'Updated'}
        </Badge>
      )}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {new Date(lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
}
