
import React from "react";

export interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'dialog' | 'pdf' | 'video';
  category: string;
  lastUpdated: string;
  version?: string;
  changelog?: ChangelogEntry[];
  icon: React.ComponentType<{ className?: string }>;
  
  // For PDF resources
  fileUrl?: string;
  
  // For video resources
  videoUrl?: string;
  embedCode?: string;
  duration?: string;
  thumbnail?: string;
  
  // Role-based access
  roles?: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}
