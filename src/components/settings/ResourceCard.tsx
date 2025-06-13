
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Play, History, Clock } from "lucide-react";
import { VersionBadge } from "./VersionBadge";
import { ChangelogDialog } from "./ChangelogDialog";
import type { TrainingResource } from "./types";

interface ResourceCardProps {
  resource: TrainingResource;
  onAction: () => void;
}

export function ResourceCard({ resource, onAction }: ResourceCardProps) {
  const [showChangelog, setShowChangelog] = useState(false);
  const Icon = resource.icon;

  const renderActionButton = () => {
    const baseClasses = "w-full flex items-center gap-2";
    
    switch (resource.type) {
      case 'dialog':
        return (
          <Button onClick={onAction} className={baseClasses}>
            <Eye className="h-4 w-4" />
            View Guide
          </Button>
        );
      case 'pdf':
        return (
          <Button onClick={onAction} className={baseClasses} variant="outline">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        );
      case 'video':
        return (
          <Button onClick={onAction} className={baseClasses} variant="secondary">
            <Play className="h-4 w-4" />
            Watch Video
            {resource.duration && (
              <span className="text-xs text-muted-foreground ml-1">
                ({resource.duration})
              </span>
            )}
          </Button>
        );
      default:
        return null;
    }
  };

  const renderThumbnail = () => {
    if (resource.type === 'video' && resource.thumbnail) {
      return (
        <div className="relative mb-3 rounded-md overflow-hidden">
          <img 
            src={resource.thumbnail} 
            alt={`${resource.title} thumbnail`}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-2">
              <Play className="h-6 w-6 text-primary" />
            </div>
          </div>
          {resource.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {resource.duration}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {resource.category}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {resource.type}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight">
            {resource.title}
          </CardTitle>
          <VersionBadge 
            version={resource.version}
            lastUpdated={resource.lastUpdated}
          />
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {renderThumbnail()}
          
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {resource.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated: {new Date(resource.lastUpdated).toLocaleDateString()}
              </div>
              {resource.changelog && resource.changelog.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChangelog(true)}
                  className="text-xs h-6 px-2"
                >
                  <History className="h-3 w-3 mr-1" />
                  History
                </Button>
              )}
            </div>
            
            {renderActionButton()}
          </div>
        </CardContent>
      </Card>

      {resource.changelog && (
        <ChangelogDialog
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
          title={resource.title}
          changelog={resource.changelog}
        />
      )}
    </>
  );
}
