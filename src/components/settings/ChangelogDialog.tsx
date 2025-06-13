
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle } from "lucide-react";
import type { ChangelogEntry } from "./types";

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  changelog: ChangelogEntry[];
}

export function ChangelogDialog({ 
  isOpen, 
  onClose, 
  title, 
  changelog 
}: ChangelogDialogProps) {
  const getTypeColor = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Version History: {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {changelog.map((entry, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-4 relative">
              <div className="absolute -left-2 top-2 w-4 h-4 bg-primary rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`text-xs ${getTypeColor(entry.type)}`}>
                  v{entry.version} ({entry.type})
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
              
              <ul className="space-y-1">
                {entry.changes.map((change, changeIndex) => (
                  <li key={changeIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
