
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ApprovedTread {
  id: string;
  tread_code: string;
  status?: string;
  notes?: string;
  category?: string;
  display_order: number;
  is_active: boolean;
}

interface EditTreadDialogProps {
  tread: ApprovedTread | null;
  onClose: () => void;
  onTreadUpdated: () => void;
  onTreadChange: (tread: ApprovedTread) => void;
}

export function EditTreadDialog({ tread, onClose, onTreadUpdated, onTreadChange }: EditTreadDialogProps) {
  const { toast } = useToast();

  const handleUpdateTread = async () => {
    if (!tread) return;

    try {
      const { error } = await supabase
        .from('approved_treads')
        .update({
          tread_code: tread.tread_code,
          status: tread.status || null,
          notes: tread.notes || null,
          category: tread.category || null
        })
        .eq('id', Number(tread.id));

      if (error) {
        console.error('Error updating tread:', error);
        toast({
          title: "Error",
          description: "Failed to update tread",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Tread updated successfully"
        });
        onClose();
        onTreadUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update tread",
        variant: "destructive"
      });
    }
  };

  if (!tread) return null;

  return (
    <Dialog open={!!tread} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-amber-400">Edit Approved Tread</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit_tread_code">Tread Code *</Label>
            <Input
              id="edit_tread_code"
              value={tread.tread_code}
              onChange={(e) => onTreadChange({ ...tread, tread_code: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="edit_status">Status</Label>
            <Input
              id="edit_status"
              value={tread.status || ""}
              onChange={(e) => onTreadChange({ ...tread, status: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="edit_notes">Notes</Label>
            <Textarea
              id="edit_notes"
              value={tread.notes || ""}
              onChange={(e) => onTreadChange({ ...tread, notes: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTread} className="bg-green-600 hover:bg-green-700">
              Update Tread
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
