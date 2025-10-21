import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type CrossDockRequestRow = Database["public"]["Tables"]["cross_dock_requests"]["Row"];

export default function CrossDockRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CrossDockRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from("cross_dock_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as unknown as CrossDockRequestRow[]) ?? []);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cross-dock requests.",
      });
    } finally {
      setLoading(false);
    }
  }

  const filtered = requests.filter((r) => {
    const t = searchTerm.toLowerCase();
    return (
      (r.request_number ?? "").toLowerCase().includes(t) ||
      (r.requesting_store ?? "").toLowerCase().includes(t) ||
      (r.sending_store ?? "").toLowerCase().includes(t)
    );
  });

  function StatusBadge({ status }: { status: string }) {
    const label =
      status === "pending"
        ? "Pending"
        : status === "approved"
        ? "Approved"
        : status === "fulfilled"
        ? "Fulfilled"
        : status === "denied"
        ? "Denied"
        : status;
    return <span className="text-xs px-2 py-1 rounded border">{label}</span>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cross-Dock Requests</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your cross-dock requests
          </p>
        </div>
        <Button onClick={() => navigate("/cross-dock-request")}>
          New Request
        </Button>
      </div>

      <div className="mb-4 max-w-md relative">
        <Input
          placeholder="Search by request #, requesting or sending store…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-3"
        />
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm">
              {searchTerm ? "No requests match your search." : "No cross-dock requests yet."}
            </p>
            {!searchTerm && (
              <Button variant="outline" className="mt-4" onClick={() => navigate("/cross-dock-request")}>
                Create Your First Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          <div className="grid grid-cols-7 gap-3 text-xs font-medium px-2">
            <div>Request #</div>
            <div>Requesting Store</div>
            <div>Sending Store</div>
            <div>Desired Date</div>
            <div>Status</div>
            <div>Submitted By</div>
            <div>Created</div>
          </div>
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/cross-dock-request/${r.id}`)}
              className="grid grid-cols-7 gap-3 items-center text-left px-2 py-2 rounded hover:bg-muted/50"
            >
              <div>{r.request_number}</div>
              <div>{r.requesting_store}</div>
              <div>{r.sending_store}</div>
              <div>
                {r.desired_delivery_date
                  ? format(new Date(r.desired_delivery_date), "MMM d, yyyy")
                  : "Not specified"}
              </div>
              <div><StatusBadge status={r.status ?? "pending"} /></div>
              <div>{r.submitted_by_name || "N/A"}</div>
              <div>{r.created_at ? format(new Date(r.created_at), "MMM d, yyyy") : "-"}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
