
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ApprovedTread {
  id: string;
  tread_code: string;
  status?: string;
  notes?: string;
  category?: string;
  display_order: number;
  is_active: boolean;
}

interface TreadItemProps {
  tread: ApprovedTread;
  isAdmin: boolean;
  onEdit: (tread: ApprovedTread) => void;
  onDelete: (id: string) => void;
}

export function TreadItem({ tread, isAdmin, onEdit, onDelete }: TreadItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-amber-400/50 transition-colors group">
      <div className="flex-1">
        <span className="font-mono text-lg text-white tracking-wider">
          {tread.tread_code}
        </span>
        {tread.status && (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-400/50 ml-2">
            {tread.status}
          </Badge>
        )}
      </div>
      {isAdmin && (
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(tread)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(tread.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
