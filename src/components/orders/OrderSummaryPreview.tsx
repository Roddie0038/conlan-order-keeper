// src/components/orders/OrderSummaryPreview.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  enabled: boolean;
  crossPlantData: {
    ordering_store: string | null;
    ordering_plant: string | null;
    destination_plant: string | null;
  };
  legacyData: {
    store: string;
    plant: string;
  };
};

export const OrderSummaryPreview: React.FC<Props> = ({ enabled, crossPlantData, legacyData }) => {
  const [showSummary, setShowSummary] = React.useState(false);

  if (!enabled) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 p-4">
      <Button
        type="button"
        variant="ghost"
        className="mb-3 flex w-full items-center justify-between p-0 text-foreground hover:bg-transparent"
        onClick={() => setShowSummary(s => !s)}
      >
        <span className="font-medium">Order Summary Preview</span>
        {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {showSummary && (
        <div className="space-y-2 text-sm text-foreground">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <span className="font-medium text-primary">Ordering as (Source Store):</span>
              <div className="text-muted-foreground">{crossPlantData.ordering_store || '—'}</div>
            </div>
            <div>
              <span className="font-medium text-primary">Fulfillment Plant (Source):</span>
              <div className="text-muted-foreground">{crossPlantData.ordering_plant || '—'}</div>
            </div>
            <div>
              <span className="font-medium text-primary">Ship To Plant (Destination):</span>
              <div className="text-muted-foreground">{crossPlantData.destination_plant || '—'}</div>
            </div>
            <div>
              <span className="font-medium text-primary">Destination Store (legacy):</span>
              <div className="text-muted-foreground">{legacyData.store || '—'}</div>
            </div>
          </div>
          
          {crossPlantData.ordering_plant && crossPlantData.destination_plant && 
           crossPlantData.ordering_plant !== crossPlantData.destination_plant && (
            <div className="mt-3 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-blue-800 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-200">
              ✓ Cross-plant order: {crossPlantData.ordering_plant} → {crossPlantData.destination_plant}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};