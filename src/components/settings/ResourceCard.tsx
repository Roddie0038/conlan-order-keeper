
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";
import type { TrainingResource } from "./ResourcesTraining";

interface ResourceCardProps {
  resource: TrainingResource;
  onAction: () => void;
}

export function ResourceCard({ resource, onAction }: ResourceCardProps) {
  const Icon = resource.icon;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {resource.category}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">
          {resource.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {resource.description}
        </p>
        
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(resource.lastUpdated).toLocaleDateString()}
          </div>
          
          <Button 
            onClick={onAction}
            className="w-full flex items-center gap-2"
            variant={resource.type === 'dialog' ? 'default' : 'outline'}
          >
            {resource.type === 'dialog' ? (
              <>
                <Eye className="h-4 w-4" />
                View Guide
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
