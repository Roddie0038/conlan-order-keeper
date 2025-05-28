
import { Card } from "@/components/ui/card";
import { TreadItem } from "./TreadItem";

interface ApprovedTread {
  id: string;
  tread_code: string;
  status?: string;
  notes?: string;
  category?: string;
  display_order: number;
  is_active: boolean;
}

interface TreadListProps {
  treads: ApprovedTread[];
  isAdmin: boolean;
  onEditTread: (tread: ApprovedTread) => void;
  onDeleteTread: (id: string) => void;
}

export function TreadList({ treads, isAdmin, onEditTread, onDeleteTread }: TreadListProps) {
  const organizeIntoColumns = (items: ApprovedTread[]) => {
    const midpoint = Math.ceil(items.length / 2);
    return {
      leftColumn: items.slice(0, midpoint),
      rightColumn: items.slice(midpoint)
    };
  };

  const { leftColumn, rightColumn } = organizeIntoColumns(treads);

  return (
    <Card className="bg-slate-800/30 border-slate-600 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          {leftColumn.map((tread) => (
            <TreadItem
              key={tread.id}
              tread={tread}
              isAdmin={isAdmin}
              onEdit={onEditTread}
              onDelete={onDeleteTread}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {rightColumn.map((tread) => (
            <TreadItem
              key={tread.id}
              tread={tread}
              isAdmin={isAdmin}
              onEdit={onEditTread}
              onDelete={onDeleteTread}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
