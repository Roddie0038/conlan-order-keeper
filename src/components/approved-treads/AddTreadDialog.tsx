
// @ts-nocheck
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddTreadDialogProps {
  onClose: () => void;
  onTreadAdded: () => void;
}

export function AddTreadDialog({ onClose, onTreadAdded }: AddTreadDialogProps) {
  const { toast } = useToast();
  const [newTread, setNewTread] = useState({
    tread_code: "",
    status: "",
    notes: "",
    category: ""
  });

  const handleAddTread = async () => {
    if (!newTread.tread_code.trim()) {
      toast({
        title: "Error",
        description: "Tread code is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingTreads } = await supabase
        .from('approved_treads')
        .select('display_order')
        .eq('is_active', true);
      
      const maxOrder = Math.max(...(existingTreads?.map(t => t.display_order) || [0]), 0);
      
      const { error } = await supabase
        .from('approved_treads')
        .insert({
          tread_code: newTread.tread_code,
          status: newTread.status || null,
          notes: newTread.notes || null,
          category: newTread.category || null,
          display_order: maxOrder + 1
        });

      if (error) {
        console.error('Error adding tread:', error);
        toast({
          title: "Error",
          description: "Failed to add tread",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Tread added successfully"
        });
        setNewTread({ tread_code: "", status: "", notes: "", category: "" });
        onClose();
        onTreadAdded();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add tread",
        variant: "destructive"
      });
    }
  };

  return (
    <DialogContent className="bg-slate-800 border-slate-600 text-white">
      <DialogHeader>
        <DialogTitle className="text-amber-400">Add New Approved Tread</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="tread_code">Tread Code *</Label>
          <Input
            id="tread_code"
            value={newTread.tread_code}
            onChange={(e) => setNewTread({ ...newTread, tread_code: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="e.g., HDL 26/32"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={newTread.status}
            onChange={(e) => setNewTread({ ...newTread, status: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="e.g., Moving to HT11"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={newTread.notes}
            onChange={(e) => setNewTread({ ...newTread, notes: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Additional notes..."
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddTread} className="bg-green-600 hover:bg-green-700">
            Add Tread
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
