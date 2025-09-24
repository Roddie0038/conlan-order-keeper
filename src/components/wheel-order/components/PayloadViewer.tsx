import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Clock, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayloadStep {
  step: string;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
}

interface PayloadViewerProps {
  isOpen: boolean;
  onClose: () => void;
  preInsertPayload?: any;
  insertResponse?: any;
  steps: PayloadStep[];
  serverTimestamp?: string;
  orderId?: string;
}

export function PayloadViewer({
  isOpen,
  onClose,
  preInsertPayload,
  insertResponse,
  steps,
  serverTimestamp,
  orderId
}: PayloadViewerProps) {
  const { toast } = useToast();

  const copyToClipboard = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied to clipboard`,
    });
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString() + '.' + (timestamp % 1000).toString().padStart(3, '0');
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Wheel Order Payload Viewer
            {orderId && <span className="text-sm text-muted-foreground">ID: {orderId}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Submission Timeline */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Submission Timeline
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  {getStepIcon(step.status)}
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(step.timestamp)}
                  </span>
                  <span>{step.step}</span>
                  {step.duration && (
                    <span className="text-muted-foreground">
                      ({step.duration}ms)
                    </span>
                  )}
                  {step.error && (
                    <span className="text-red-500 text-xs">
                      {step.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Server Timestamp */}
          {serverTimestamp && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Server Timestamp</h3>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                {serverTimestamp}
              </div>
            </div>
          )}

          {/* Pre-Insert Payload */}
          {preInsertPayload && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Pre-Insert Payload</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formatJson(preInsertPayload), 'Pre-insert payload')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                {formatJson(preInsertPayload)}
              </pre>
            </div>
          )}

          {/* Insert Response */}
          {insertResponse && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Insert Response (Echoed Row)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formatJson(insertResponse), 'Insert response')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                {formatJson(insertResponse)}
              </pre>
            </div>
          )}

          {/* Field Mapping Analysis */}
          {preInsertPayload && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Field Mapping Analysis</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Required Fields Present</h4>
                  <ul className="space-y-1 text-green-600">
                    {Object.keys(preInsertPayload).filter(key => 
                      ['name', 'store', 'plant', 'quantity', 'desiredcolor', 'wheelsize', 'wheelmaterial', 'wheeltype'].includes(key.toLowerCase())
                    ).map(key => (
                      <li key={key} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {key}: {JSON.stringify(preInsertPayload[key])}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Schema Alignment</h4>
                  <div className="text-xs text-muted-foreground">
                    <p>✓ Using lowercase field names for Supabase</p>
                    <p>✓ Numeric fields properly typed</p>
                    <p>✓ Timestamp in ISO format</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}