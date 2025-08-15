import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TRANSFER_ROUTES, CARRIER_OPTIONS, type TransferRoute, type Carrier } from '@/types/orders';
import { PLANT_STORE_MAP } from '@/utils/plantMapping';

interface PlantToPlantSectionProps {
  value: {
    transfer_route?: TransferRoute | string;
    carrier?: Carrier | string;
    fulfillment_plant?: string;
    destination_plant?: string;
    destination_store?: string;
    cross_dock_from?: string;
    cross_dock_to?: string;
    cross_dock_type?: string;
  };
  onChange: (patch: Partial<PlantToPlantSectionProps['value']>) => void;
  onScheduledArrivalChange?: (value: string) => void;
  hideScheduledArrival?: boolean;
  className?: string;
}

export function PlantToPlantSection({
  value,
  onChange,
  onScheduledArrivalChange,
  hideScheduledArrival = false,
  className = '',
}: PlantToPlantSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isPlantToPlant = value.transfer_route === 'plant->plant';
  
  // Auto-expand when user selects plant-to-plant or destination plant
  useEffect(() => {
    if (isPlantToPlant || (value.destination_plant && value.destination_plant.length > 0)) {
      setIsOpen(true);
    }
  }, [isPlantToPlant, value.destination_plant]);

  // Auto-set scheduled arrival to N/A for plant-to-plant transfers
  useEffect(() => {
    if (isPlantToPlant && onScheduledArrivalChange && !hideScheduledArrival) {
      onScheduledArrivalChange('N/A');
    }
  }, [isPlantToPlant, onScheduledArrivalChange, hideScheduledArrival]);

  const plants = Object.keys(PLANT_STORE_MAP);
  const allStores = Object.values(PLANT_STORE_MAP).flat();
  
  // Get stores for selected destination plant
  const destinationStores = value.destination_plant 
    ? PLANT_STORE_MAP[value.destination_plant] || []
    : allStores;

  return (
    <section className={`rounded-2xl border border-muted bg-card/40 backdrop-blur p-4 mt-6 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-0 hover:bg-transparent"
            type="button"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Plant-to-Plant / Cross-Region Shipment
              </h3>
              <p className="text-sm text-muted-foreground">
                For orders shipped between plants or to stores in another region. Configure route, carrier, and destination.
              </p>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <div className="mt-4 space-y-4">
            {/* Auto-expand info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                This section automatically expands when Plant→Plant is selected or a destination plant is chosen.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transfer Route */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Transfer Route</Label>
                <Select
                  value={value.transfer_route || ''}
                  onValueChange={(val) => onChange({ transfer_route: val as TransferRoute })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transfer route..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSFER_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Carrier */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Carrier</Label>
                <Select
                  value={value.carrier || ''}
                  onValueChange={(val) => onChange({ carrier: val as Carrier })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select carrier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIER_OPTIONS.map((carrier) => (
                      <SelectItem key={carrier.value} value={carrier.value}>
                        {carrier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fulfillment Plant (Source) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fulfillment Plant (Source)</Label>
                <Select
                  value={value.fulfillment_plant || ''}
                  onValueChange={(val) => onChange({ fulfillment_plant: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source plant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ship to Plant (Destination) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ship to Plant (Destination)</Label>
                <Select
                  value={value.destination_plant || ''}
                  onValueChange={(val) => onChange({ destination_plant: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select destination plant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Store (optional) */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Destination Store (optional)</Label>
                <Select
                  value={value.destination_store || ''}
                  onValueChange={(val) => onChange({ destination_store: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select destination store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationStores.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cross-Dock (optional) */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Cross-Dock Configuration (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cross-Dock From (Plant)</Label>
                  <Select
                    value={value.cross_dock_from || ''}
                    onValueChange={(val) => onChange({ cross_dock_from: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {plants.map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cross-Dock To (Plant)</Label>
                  <Select
                    value={value.cross_dock_to || ''}
                    onValueChange={(val) => onChange({ cross_dock_to: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {plants.map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cross-Dock Type</Label>
                  <Select
                    value={value.cross_dock_type || ''}
                    onValueChange={(val) => onChange({ cross_dock_type: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Relay">Relay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="space-y-1">
                <li>• If Transfer Route = <strong>Plant→Plant</strong>, "Scheduled Arrival" is automatically set to <strong>N/A</strong> and hidden.</li>
                <li>• All transfer metadata is saved to the database for tracking and processing.</li>
                <li>• Cross-dock configuration is optional and only used for complex routing scenarios.</li>
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}