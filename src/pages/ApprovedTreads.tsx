
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/extended-client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ApprovedTread {
  id: string;
  tread_code: string;
  status?: string;
  notes?: string;
  category?: string;
  display_order: number;
}

export default function ApprovedTreads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [treads, setTreads] = useState<ApprovedTread[]>([]);
  const [filteredTreads, setFilteredTreads] = useState<ApprovedTread[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching treads:', error);
        // If table doesn't exist, use fallback data
        setTreads(getDefaultTreads());
      } else {
        setTreads(data || getDefaultTreads());
      }
    } catch (error) {
      console.error('Error:', error);
      setTreads(getDefaultTreads());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTreads = (): ApprovedTread[] => [
    { id: '1', tread_code: 'HDL 26/32', display_order: 1 },
    { id: '2', tread_code: 'HT3 EP', status: 'Moving to HT11', display_order: 2 },
    { id: '3', tread_code: 'TDT', display_order: 3 },
    { id: '4', tread_code: 'TRT', display_order: 4 },
    { id: '5', tread_code: 'HSR1', display_order: 5 },
    { id: '6', tread_code: 'HDR1', display_order: 6 },
    { id: '7', tread_code: 'HSL2', display_order: 7 },
    { id: '8', tread_code: 'HT11', display_order: 8 },
    { id: '9', tread_code: 'HDA5', display_order: 9 },
    { id: '10', tread_code: 'HSL1', display_order: 10 },
    { id: '11', tread_code: 'HSR2', display_order: 11 },
    { id: '12', tread_code: 'HDR2', display_order: 12 }
  ];

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
            Only the following tread designs are approved. Any new or alternate tread must be cleared by{" "}
            <span className="text-amber-400 font-semibold">Steve Bobovnik</span>,{" "}
            <span className="text-amber-400 font-semibold">Brad Perry</span>, or{" "}
            <span className="text-amber-400 font-semibold">Greg Williamson</span>.
          </p>
        </Card>

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
                <div key={tread.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-amber-400/50 transition-colors">
                  <span className="font-mono text-lg text-white tracking-wider">
                    {tread.tread_code}
                  </span>
                  {tread.status && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-400/50">
                      {tread.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {rightColumn.map((tread) => (
                <div key={tread.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-amber-400/50 transition-colors">
                  <span className="font-mono text-lg text-white tracking-wider">
                    {tread.tread_code}
                  </span>
                  {tread.status && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-400/50">
                      {tread.status}
                    </Badge>
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
            <strong>Important:</strong> Mold Cure treads may be used for sales purposes only. No stock builds allowed.
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
    </div>
  );
}
