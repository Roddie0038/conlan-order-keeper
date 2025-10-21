import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Truck, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CrossDockRequest {
  id: string;
  request_number: string;
  requesting_store: string;
  sending_store: string;
  desired_delivery_date: string | null;
  notes: string | null;
  status: string;
  plant: string;
  submitted_by_email: string | null;
  submitted_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export default function CrossDockRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CrossDockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // @ts-ignore - Table exists but types not yet regenerated
      const { data, error } = await supabase
        .from("cross_dock_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests((data || []) as any);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cross-dock requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) =>
    request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requesting_store.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.sending_store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "default", label: "Pending" },
      approved: { variant: "secondary", label: "Approved" },
      fulfilled: { variant: "outline", label: "Fulfilled" },
      denied: { variant: "destructive", label: "Denied" },
    };

    const statusInfo = statusMap[status] || { variant: "default" as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cross-Dock Requests</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your cross-dock requests
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/cross-dock-request")}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by request number, requesting store, or sending store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No requests match your search." : "No cross-dock requests yet."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => navigate("/cross-dock-request")}
                variant="outline"
                className="mt-4"
              >
                Create Your First Request
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request #</TableHead>
                  <TableHead>Requesting Store</TableHead>
                  <TableHead>Sending Store</TableHead>
                  <TableHead>Desired Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell>{request.requesting_store}</TableCell>
                    <TableCell>{request.sending_store}</TableCell>
                    <TableCell>
                      {request.desired_delivery_date
                        ? format(new Date(request.desired_delivery_date), "MMM d, yyyy")
                        : "Not specified"}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.submitted_by_name || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}