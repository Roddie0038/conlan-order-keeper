import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Package, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { CrossDockRequest } from '@/hooks/useFetchCrossDockRequests';
import { useFetchCrossDockDetails } from '@/hooks/useFetchCrossDockDetails';

interface TransferDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CrossDockRequest | null;
}

export function TransferDetailsModal({ open, onOpenChange, request }: TransferDetailsModalProps) {
  const { items, auditLog, loading } = useFetchCrossDockDetails(request?.id || null);

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

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Transfer Request Details</span>
            <Badge variant="outline" className={getStatusColor(request.status)}>
              {request.status.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Request #{request.request_number} • Created {format(new Date(request.created_at), 'MMM dd, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Request Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Request Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Source Plant:</span>
                  <p className="font-medium">{request.plant}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sending Store:</span>
                  <p className="font-medium">{request.sending_store}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Destination Store:</span>
                  <p className="font-medium">{request.requesting_store}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Desired Delivery Date:</span>
                  <p className="font-medium">
                    {request.desired_delivery_date 
                      ? format(new Date(request.desired_delivery_date), 'MMM dd, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted By:</span>
                  <p className="font-medium">{request.submitted_by_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{request.submitted_by_email || ''}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{format(new Date(request.updated_at), 'MMM dd, yyyy h:mm a')}</p>
                </div>
              </div>
              {request.notes && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="mt-1 text-sm">{request.notes}</p>
                </div>
              )}
            </Card>

            {/* Items */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No items found for this request.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_number}</TableCell>
                          <TableCell>{item.description || 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span>Total Items:</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span>Total Quantity:</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Audit Trail */}
            {auditLog.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity History
                </h3>
                <div className="space-y-3">
                  {auditLog.map((log, index) => (
                    <div key={log.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{log.action}</span>
                            {log.old_status && log.new_status && (
                              <span className="text-xs text-muted-foreground">
                                {log.old_status} → {log.new_status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {log.user_email || 'System'} • {format(new Date(log.created_at), 'MMM dd, yyyy h:mm a')}
                          </p>
                          {log.notes && (
                            <p className="text-sm mt-1 text-muted-foreground italic">"{log.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
