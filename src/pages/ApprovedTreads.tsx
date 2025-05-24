
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search, Plus, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function ApprovedTreads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treads, setTreads] = useState<ApprovedTread[]>([]);
  const [filteredTreads, setFilteredTreads] = useState<ApprovedTread[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTread, setEditingTread] = useState<ApprovedTread | null>(null);
  const [newTread, setNewTread] = useState({
    tread_code: "",
    status: "",
    notes: "",
    category: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTreads();
  }, [user, navigate]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTreads(
        treads.filter(tread =>
          tread.tread_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tread.status && tread.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tread.notes && tread.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredTreads(treads);
    }
  }, [searchTerm, treads]);

  const fetchTreads = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_treads')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching treads:', error);
        toast({
          title: "Error",
          description: "Failed to load approved treads",
          variant: "destructive"
        });
      } else {
        setTreads(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load approved treads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      const maxOrder = Math.max(...treads.map(t => t.display_order), 0);
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
        setShowAddDialog(false);
        fetchTreads();
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

  const handleDeleteTread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('approved_treads')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting tread:', error);
        toast({
          title: "Error",
          description: "Failed to delete tread",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Tread deleted successfully"
        });
        fetchTreads();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete tread",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTread = async () => {
    if (!editingTread) return;

    try {
      const { error } = await supabase
        .from('approved_treads')
        .update({
          tread_code: editingTread.tread_code,
          status: editingTread.status || null,
          notes: editingTread.notes || null,
          category: editingTread.category || null
        })
        .eq('id', editingTread.id);

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
        setEditingTread(null);
        fetchTreads();
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

  const organizeIntoColumns = (items: ApprovedTread[]) => {
    const midpoint = Math.ceil(items.length / 2);
    return {
      leftColumn: items.slice(0, midpoint),
      rightColumn: items.slice(midpoint)
    };
  };

  const { leftColumn, rightColumn } = organizeIntoColumns(filteredTreads);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
            <p className="mt-4 text-gray-400">Loading approved treads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 py-8">
        <div className="container mx-auto max-w-4xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-amber-400 tracking-wide">
            APPROVED TREAD TO RUN
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6 space-y-8">
        {/* Info Box */}
        <Card className="bg-slate-800/50 border-slate-600 p-6">
          <p className="text-gray-300 text-center leading-relaxed">
            Approval is required from{" "}
            <span className="text-amber-400 font-semibold">Steve Bobovnik</span>,{" "}
            <span className="text-amber-400 font-semibold">Brad Perry</span>, or{" "}
            <span className="text-amber-400 font-semibold">Greg Williamson</span>{" "}
            for any tread not listed below.
          </p>
        </Card>

        {/* Admin Controls */}
        {user?.isAdmin && (
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
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTread} className="bg-green-600 hover:bg-green-700">
                        Add Tread
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tread codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-amber-400"
          />
        </div>

        {/* Tread List */}
        <Card className="bg-slate-800/30 border-slate-600 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              {leftColumn.map((tread) => (
                <div key={tread.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-amber-400/50 transition-colors group">
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
                  {user?.isAdmin && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTread(tread)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTread(tread.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {rightColumn.map((tread) => (
                <div key={tread.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-amber-400/50 transition-colors group">
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
                  {user?.isAdmin && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTread(tread)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTread(tread.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Warning Callout */}
        <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <AlertDescription className="text-amber-200">
            <strong>Important:</strong> MOLD CURE treads may be used as needed for sales — no stock builds allowed.
          </AlertDescription>
        </Alert>

        {/* Back Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingTread && (
        <Dialog open={!!editingTread} onOpenChange={() => setEditingTread(null)}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle className="text-amber-400">Edit Approved Tread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_tread_code">Tread Code *</Label>
                <Input
                  id="edit_tread_code"
                  value={editingTread.tread_code}
                  onChange={(e) => setEditingTread({ ...editingTread, tread_code: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Input
                  id="edit_status"
                  value={editingTread.status || ""}
                  onChange={(e) => setEditingTread({ ...editingTread, status: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editingTread.notes || ""}
                  onChange={(e) => setEditingTread({ ...editingTread, notes: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTread(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTread} className="bg-green-600 hover:bg-green-700">
                  Update Tread
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
