import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { TransferRouteSelector } from './TransferRouteSelector';
import { CarrierSelector } from './CarrierSelector';
import { type TransferRoute, type Carrier } from '@/types/orders';

interface CollapsibleTransferSectionProps {
  transferRoute?: TransferRoute;
  carrier?: Carrier;
  onTransferRouteChange: (value: TransferRoute) => void;
  onCarrierChange: (value: Carrier) => void;
  className?: string;
}

export function CollapsibleTransferSection({
  transferRoute,
  carrier,
  onTransferRouteChange,
  onCarrierChange,
  className = '',
}: CollapsibleTransferSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Info memo banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Ordering from another plant or store?</p>
          <p>If you need to order from a different plant or store outside your plant, you may need a long-distance carrier. Expand this section to select transfer details.</p>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-4 bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Transfer & Shipping Details</span>
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <Card className="mt-2">
            <CardContent className="p-4 space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Choose a carrier only if your order requires transfer from a different plant or store outside your plant.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TransferRouteSelector
                  value={transferRoute}
                  onChange={onTransferRouteChange}
                />
                
                <CarrierSelector
                  value={carrier}
                  onChange={onCarrierChange}
                />
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}