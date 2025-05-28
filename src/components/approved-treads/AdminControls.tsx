
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddTreadDialog } from "./AddTreadDialog";

interface AdminControlsProps {
  isAdmin: boolean;
  onTreadAdded: () => void;
}

export function AdminControls({ isAdmin, onTreadAdded }: AdminControlsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (!isAdmin) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-amber-400">Admin Controls</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Tread
            </Button>
          </DialogTrigger>
          <AddTreadDialog 
            onClose={() => setShowAddDialog(false)}
            onTreadAdded={onTreadAdded}
          />
        </Dialog>
      </div>
    </Card>
  );
}
