
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ApprovedTreadsHeader } from "@/components/approved-treads/ApprovedTreadsHeader";
import { ApprovalInfoCard } from "@/components/approved-treads/ApprovalInfoCard";
import { AdminControls } from "@/components/approved-treads/AdminControls";
import { SearchBar } from "@/components/approved-treads/SearchBar";
import { TreadList } from "@/components/approved-treads/TreadList";
import { EditTreadDialog } from "@/components/approved-treads/EditTreadDialog";
import { WarningCallout } from "@/components/approved-treads/WarningCallout";
import { LoadingSpinner } from "@/components/approved-treads/LoadingSpinner";

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
  const [editingTread, setEditingTread] = useState<ApprovedTread | null>(null);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ApprovedTreadsHeader />

      <div className="container mx-auto max-w-4xl p-6 space-y-8">
        <ApprovalInfoCard />

        <AdminControls 
          isAdmin={user?.isAdmin || false}
          onTreadAdded={fetchTreads}
        />

        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <TreadList 
          treads={filteredTreads}
          isAdmin={user?.isAdmin || false}
          onEditTread={setEditingTread}
          onDeleteTread={handleDeleteTread}
        />

        <WarningCallout />

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <EditTreadDialog 
        tread={editingTread}
        onClose={() => setEditingTread(null)}
        onTreadUpdated={fetchTreads}
        onTreadChange={setEditingTread}
      />
    </div>
  );
}
