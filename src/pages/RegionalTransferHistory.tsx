import { useState, useMemo } from 'react';
import { useFetchCrossDockRequests, type CrossDockRequest } from '@/hooks/useFetchCrossDockRequests';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TransferDetailsModal } from '@/components/regional-transfer/TransferDetailsModal';

export default function RegionalTransferHistory() {
  const { requests, loading, error } = useFetchCrossDockRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSourcePlant, setFilterSourcePlant] = useState('all');
  const [filterDestStore, setFilterDestStore] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CrossDockRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (request: CrossDockRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  // Extract unique plants and stores for filters
  const { uniquePlants, uniqueStores } = useMemo(() => {
    const plants = new Set<string>();
    const stores = new Set<string>();
    
    requests.forEach(req => {
      if (req.plant) plants.add(req.plant);
      if (req.sending_store) plants.add(req.sending_store);
      if (req.requesting_store) stores.add(req.requesting_store);
    });

    return {
      uniquePlants: Array.from(plants).sort(),
      uniqueStores: Array.from(stores).sort()
    };
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = 
        searchTerm === '' ||
        req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requesting_store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.sending_store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.plant?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSourcePlant = 
        filterSourcePlant === 'all' ||
        req.plant === filterSourcePlant ||
        req.sending_store === filterSourcePlant;

      const matchesDestStore = 
        filterDestStore === 'all' ||
        req.requesting_store === filterDestStore;

      const matchesStatus = 
        filterStatus === 'all' ||
        req.status === filterStatus;

      return matchesSearch && matchesSourcePlant && matchesDestStore && matchesStatus;
    });
  }, [requests, searchTerm, filterSourcePlant, filterDestStore, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-destructive">Error loading regional transfers: {error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regional Transfer History</h1>
        <p className="text-muted-foreground mt-2">
          View and track all cross-plant and regional transfers
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                type="search"
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select value={filterSourcePlant} onValueChange={setFilterSourcePlant}>
                <SelectTrigger>
                  <SelectValue placeholder="Source Plant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Source Plants</SelectItem>
                  {uniquePlants.map(plant => (
                    <SelectItem key={plant} value={plant}>{plant}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterDestStore} onValueChange={setFilterDestStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {uniqueStores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredRequests.length} of {requests.length} transfers
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source Plant</TableHead>
                <TableHead>Sending Store</TableHead>
                <TableHead>Destination Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Delivery Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No regional transfers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map(req => (
                  <TableRow 
                    key={req.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(req)}
                  >
                    <TableCell className="font-medium">{req.request_number}</TableCell>
                    <TableCell>
                      {format(new Date(req.created_at), 'MM/dd/yyyy')}
                    </TableCell>
                    <TableCell>{req.plant || 'N/A'}</TableCell>
                    <TableCell>{req.sending_store || 'N/A'}</TableCell>
                    <TableCell>{req.requesting_store}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(req.status)}>
                        {req.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{req.submitted_by_name || 'N/A'}</div>
                        <div className="text-muted-foreground text-xs">
                          {req.submitted_by_email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.desired_delivery_date 
                        ? format(new Date(req.desired_delivery_date), 'MM/dd/yyyy')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <TransferDetailsModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        request={selectedRequest}
      />
    </div>
  );
}
