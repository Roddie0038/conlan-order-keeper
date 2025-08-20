import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
    crossDockConfirmation?: boolean;
  };
  onChange: (patch: Partial<PlantToPlantSectionProps['value']>) => void;
  onScheduledArrivalChange?: (value: string) => void;
  hideScheduledArrival?: boolean;
  className?: string;
  form?: any; // For form control access
}

export function PlantToPlantSection({
  value,
  onChange,
  onScheduledArrivalChange,
  hideScheduledArrival = false,
  className = '',
  form,
}: PlantToPlantSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isPlantToPlant = value.transfer_route === 'plant->plant';
  
  // Auto-expand disabled - section remains collapsed by default

  // Auto-set scheduled arrival to N/A for plant-to-plant transfers
  useEffect(() => {
    if (isPlantToPlant && onScheduledArrivalChange && !hideScheduledArrival) {
      onScheduledArrivalChange('N/A');
    }
  }, [isPlantToPlant, onScheduledArrivalChange, hideScheduledArrival]);

  const plants = Object.keys(PLANT_STORE_MAP);
  
  // Get stores for selected destination plant
  const destinationStores = value.destination_plant 
    ? PLANT_STORE_MAP[value.destination_plant] || []
    : [];

  // Clear destination_store if it doesn't belong to the selected plant
  useEffect(() => {
    if (value.destination_plant && value.destination_store && destinationStores.length > 0) {
      if (!destinationStores.includes(value.destination_store)) {
        onChange({ destination_store: null });
      }
    }
  }, [value.destination_plant, value.destination_store, destinationStores, onChange]);

  return (
    <section className={`rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-4 mt-6 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-4 hover:bg-primary/10 rounded-xl transition-all duration-200 border border-primary/20 hover:border-primary/40"
            type="button"
          >
            <div className="text-left">
              <h3 className="text-lg font-bold flex items-center gap-3 text-primary">
                {isOpen ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-primary" />}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Plant-to-Plant / Cross-Region Shipment
                </span>
              </h3>
              <p className="text-sm text-foreground/70 font-medium mt-1">
                For orders shipped between plants or to stores in another region. Configure route, carrier, and destination.
              </p>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <div className="mt-6 space-y-6">

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
                  disabled={!value.destination_plant}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue 
                      placeholder={
                        !value.destination_plant 
                          ? "Select destination plant first" 
                          : destinationStores.length === 0 
                            ? "No stores available for selected plant"
                            : "Select destination store..."
                      } 
                    />
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
            <div className="border-t border-primary/20 pt-6">
              <h4 className="text-base font-semibold text-primary mb-4">Cross-Dock Configuration (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

              {/* Cross-Dock Confirmation */}
              {form && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <input
                      type="checkbox"
                      id="crossDockConfirmation"
                      checked={value.crossDockConfirmation || false}
                      onChange={(e) => onChange({ crossDockConfirmation: e.target.checked })}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="crossDockConfirmation" className="text-sm font-medium cursor-pointer">
                        I confirm Cross Dock paperwork is printed and attached
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        This confirmation is required for cross dock orders
                      </p>
                    </div>
                  </div>
                </div>
              )}
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