import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SHOW_CROSS_DOCK } from '@/config/featureFlags';

interface TransportDetailsFormProps {
  carrier?: string;
  requestedPickupTime?: string;
  crossDockRequired?: boolean;
  notes?: string;
  onCarrierChange: (value: string) => void;
  onPickupTimeChange: (value: string) => void;
  onCrossDockChange: (value: boolean) => void;
  onNotesChange: (value: string) => void;
}

export function TransportDetailsForm({
  carrier,
  requestedPickupTime,
  crossDockRequired,
  notes,
  onCarrierChange,
  onPickupTimeChange,
  onCrossDockChange,
  onNotesChange,
}: TransportDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Transport Details (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Preferred Carrier</Label>
            <Input
              id="carrier"
              value={carrier || ''}
              onChange={(e) => onCarrierChange(e.target.value)}
              placeholder="Enter carrier name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pickup-time">Requested Pickup Time</Label>
            <Input
              id="pickup-time"
              type="datetime-local"
              value={requestedPickupTime || ''}
              onChange={(e) => onPickupTimeChange(e.target.value)}
            />
          </div>
        </div>

        {SHOW_CROSS_DOCK && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cross-dock"
              checked={crossDockRequired || false}
              onCheckedChange={onCrossDockChange}
            />
            <Label htmlFor="cross-dock" className="text-sm font-medium">
              Cross-dock requirement
            </Label>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special instructions or requirements..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}