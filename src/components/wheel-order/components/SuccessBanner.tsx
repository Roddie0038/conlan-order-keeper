import React from 'react';
import { CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessBannerProps {
  submittedAt: string;
  orderId: string;
  onViewPayload?: () => void;
  showPayloadButton?: boolean;
}

export function SuccessBanner({ 
  submittedAt, 
  orderId, 
  onViewPayload, 
  showPayloadButton = false 
}: SuccessBannerProps) {
  const formatDisplayTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <span>Order submitted</span>
            <span className="text-green-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDisplayTime(submittedAt)}
            </span>
            <span className="text-green-600">•</span>
            <span className="font-mono text-sm">Ref: {orderId}</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your wheel order has been successfully submitted and is being processed.
          </p>
          {showPayloadButton && onViewPayload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPayload}
              className="mt-2"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Submission Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}