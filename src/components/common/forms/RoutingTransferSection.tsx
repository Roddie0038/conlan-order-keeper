import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Route, Truck, Building2, Store, ArrowRight, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PLANT_STORE_MAP, getPlantForStore } from '@/utils/plantMapping';
import { TRANSFER_ROUTES, CARRIER_OPTIONS, type TransferRoute, type Carrier } from '@/types/orders';
import { useAuth } from '@/contexts/AuthContext';
import { hasFullStoreAccess } from '@/lib/roles';

interface RoutingData {
  // Source (for elevated users)
  source_store?: string;
  source_plant?: string;
  
  // Transfer Type
  transfer_route: TransferRoute;
  
  // Destination
  destination_plant?: string;
  destination_store?: string;
  
  // Logistics
  carrier?: Carrier;
  
  // Cross-dock (optional)
  crossDock: "Yes" | "No";
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  crossDockConfirmation?: boolean;
  cross_dock_from?: string;
  cross_dock_to?: string;
  cross_dock_type?: string;
  
  // Legacy compatibility fields
  ordering_store?: string;
  ordering_plant?: string;
  destinationPlant?: string;
  store?: string;
  scheduleArrival?: string;
}

interface RoutingTransferSectionProps {
  form: UseFormReturn<any>;
  value: RoutingData;
  onChange: (data: Partial<RoutingData>) => void;
  className?: string;
}

export function RoutingTransferSection({ 
  form, 
  value, 
  onChange, 
  className = '' 
}: RoutingTransferSectionProps) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);
  const [crossDockExpanded, setCrossDockExpanded] = useState(value.crossDock === "Yes");

  // Auto-populate source from user context
  useEffect(() => {
    if (!elevated || value.source_store) return;
    
    const defaultSourceStore = user?.store || "Unassigned";
    const defaultSourcePlant = getPlantForStore(defaultSourceStore);
    
    onChange({
      source_store: defaultSourceStore,
      source_plant: defaultSourcePlant,
      ordering_store: defaultSourceStore,
      ordering_plant: defaultSourcePlant,
    });
  }, [user, elevated, value.source_store, onChange]);

  // Auto-populate destination plant based on transfer route and destination store
  useEffect(() => {
    if (value.transfer_route === 'store->store' && value.destination_store) {
      const mappedPlant = getPlantForStore(value.destination_store);
      onChange({
        destination_plant: mappedPlant,
        destinationPlant: mappedPlant,
      });
    }
  }, [value.transfer_route, value.destination_store, onChange]);

  // Auto-set scheduled arrival for plant-to-plant transfers
  useEffect(() => {
    if (value.transfer_route === 'plant->plant') {
      onChange({
        scheduleArrival: "N/A"
      });
    }
  }, [value.transfer_route, onChange]);

  // Clear destination store when destination plant changes (if not compatible)
  useEffect(() => {
    if (value.destination_plant && value.destination_store) {
      const availableStores = PLANT_STORE_MAP[value.destination_plant] || [];
      if (!availableStores.includes(value.destination_store)) {
        onChange({
          destination_store: undefined,
          store: undefined,
        });
      }
    }
  }, [value.destination_plant, value.destination_store, onChange]);

  // Handle transfer route change
  const handleTransferRouteChange = (newRoute: TransferRoute) => {
    onChange({
      transfer_route: newRoute,
      // Clear destination fields that may no longer be relevant
      destination_store: undefined,
      destination_plant: undefined,
      destinationPlant: undefined,
      store: undefined,
    });
  };

  // Handle cross-dock toggle
  const handleCrossDockChange = (enabled: "Yes" | "No") => {
    setCrossDockExpanded(enabled === "Yes");
    onChange({
      crossDock: enabled,
      // Clear cross-dock fields if disabled
      ...(enabled === "No" && {
        crossDockDestination: undefined,
        receiverNo: undefined,
        etaDate: undefined,
        crossDockConfirmation: false,
        cross_dock_from: undefined,
        cross_dock_to: undefined,
        cross_dock_type: undefined,
      })
    });
  };

  // Get destination stores based on selected plant
  const getDestinationStores = () => {
    if (!value.destination_plant) return [];
    return PLANT_STORE_MAP[value.destination_plant] || [];
  };

  // Get all plants for selection
  const getAllPlants = () => Object.keys(PLANT_STORE_MAP);

  // Check if store destination is required
  const isStoreDestinationRequired = () => {
    return value.transfer_route === 'store->store' || value.transfer_route === 'plant->store';
  };

  // Check if plant destination is required
  const isPlantDestinationRequired = () => {
    return value.transfer_route === 'plant->plant' || value.transfer_route === 'store->plant';
  };

  // Check if carrier is required
  const isCarrierRequired = () => {
    return value.transfer_route === 'plant->plant';
  };

  return (
    <Card className={`border-orange-200 dark:border-orange-800 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Route className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Routing & Transfer Details
          </h3>
        </div>

        <div className="space-y-6">
          {/* Transfer Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Transfer Type</Label>
            <RadioGroup
              value={value.transfer_route}
              onValueChange={handleTransferRouteChange}
              className="grid grid-cols-2 gap-4"
            >
              {TRANSFER_ROUTES.map((route) => (
                <div key={route.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={route.value} id={route.value} />
                  <Label htmlFor={route.value} className="text-sm cursor-pointer">
                    {route.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Source Information (Elevated Users Only) */}
          {elevated && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <Label className="text-sm font-medium">Source (Acting As)</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Source Store</Label>
                  <Select
                    value={value.source_store || ""}
                    onValueChange={(store) => onChange({
                      source_store: store,
                      source_plant: getPlantForStore(store),
                      ordering_store: store,
                      ordering_plant: getPlantForStore(store),
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source store" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PLANT_STORE_MAP).flat().map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Fulfillment Plant</Label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                    {value.source_plant || "Auto-assigned"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Destination Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-medium">Destination</Label>
            </div>

            {/* Destination Plant (for plant-to-plant or store-to-plant) */}
            {isPlantDestinationRequired() && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Destination Plant {isPlantDestinationRequired() && "*"}
                </Label>
                <Select
                  value={value.destination_plant || ""}
                  onValueChange={(plant) => onChange({
                    destination_plant: plant,
                    destinationPlant: plant,
                    // Clear destination store if not compatible
                    destination_store: undefined,
                    store: undefined,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllPlants().map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Destination Store (for store-to-store or plant-to-store) */}
            {isStoreDestinationRequired() && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Destination Store {isStoreDestinationRequired() && "*"}
                </Label>
                {value.transfer_route === 'store->store' ? (
                  // For store-to-store, show all stores and auto-assign plant
                  <Select
                    value={value.destination_store || ""}
                    onValueChange={(store) => onChange({
                      destination_store: store,
                      store: store,
                      destination_plant: getPlantForStore(store),
                      destinationPlant: getPlantForStore(store),
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination store" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PLANT_STORE_MAP).flat().map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  // For plant-to-store, filter by selected destination plant
                  value.destination_plant ? (
                    <Select
                      value={value.destination_store || ""}
                      onValueChange={(store) => onChange({
                        destination_store: store,
                        store: store,
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination store" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDestinationStores().map((store) => (
                          <SelectItem key={store} value={store}>
                            {store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-500">
                      Select destination plant first
                    </div>
                  )
                )}
              </div>
            )}

            {/* Optional destination store for plant-to-plant */}
            {value.transfer_route === 'plant->plant' && value.destination_plant && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">
                  Destination Store (Optional)
                </Label>
                <Select
                  value={value.destination_store || ""}
                  onValueChange={(store) => onChange({
                    destination_store: store || undefined,
                    store: store || "Unassigned",
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Leave blank for plant-level delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Plant-level delivery (no specific store)</SelectItem>
                    {getDestinationStores().map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Carrier Selection (for plant-to-plant) */}
          {isCarrierRequired() && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-purple-500" />
                <Label className="text-sm font-medium">Carrier *</Label>
              </div>
              <Select
                value={value.carrier || ""}
                onValueChange={(carrier) => onChange({ carrier: carrier as Carrier })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
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
          )}

          {/* Cross-Dock Section */}
          <Collapsible open={crossDockExpanded} onOpenChange={setCrossDockExpanded}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-medium">Cross-Dock Options</Label>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {crossDockExpanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <RadioGroup
                value={value.crossDock}
                onValueChange={handleCrossDockChange}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="cross-dock-no" />
                  <Label htmlFor="cross-dock-no" className="text-sm cursor-pointer">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="cross-dock-yes" />
                  <Label htmlFor="cross-dock-yes" className="text-sm cursor-pointer">Yes</Label>
                </div>
              </RadioGroup>
            </div>

            <CollapsibleContent className="space-y-4">
              {value.crossDock === "Yes" && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="crossDockDestination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Destination Store *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter destination store"
                              onChange={(e) => {
                                field.onChange(e);
                                onChange({ crossDockDestination: e.target.value });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="receiverNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Receiver No *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter receiver number"
                              onChange={(e) => {
                                field.onChange(e);
                                onChange({ receiverNo: e.target.value });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="etaDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">ETA Date *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              onChange={(e) => {
                                field.onChange(e);
                                onChange({ etaDate: e.target.value });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="crossDockConfirmation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                onChange({ crossDockConfirmation: !!checked });
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs">
                              Cross Dock paperwork attached *
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}