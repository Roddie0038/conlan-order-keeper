import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { type TransferRoute, type Carrier } from '@/types/orders';

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

interface UseRoutingTransferDataProps {
  form: UseFormReturn<any>;
  initialData?: Partial<RoutingData>;
}

export function useRoutingTransferData({ form, initialData }: UseRoutingTransferDataProps) {
  const [routingData, setRoutingData] = useState<RoutingData>({
    transfer_route: 'store->store',
    crossDock: 'No',
    ...initialData,
  });

  const updateRoutingData = useCallback((updates: Partial<RoutingData>) => {
    setRoutingData(prev => {
      const newData = { ...prev, ...updates };
      
      // Sync with form fields for backward compatibility
      const formUpdates: Record<string, any> = {};
      
      // Map routing data to form fields
      if (updates.destination_plant !== undefined) {
        formUpdates.destinationPlant = updates.destination_plant;
        formUpdates.destination_plant = updates.destination_plant;
      }
      
      if (updates.destinationPlant !== undefined) {
        formUpdates.destination_plant = updates.destinationPlant;
      }
      
      if (updates.destination_store !== undefined) {
        formUpdates.store = updates.destination_store;
      }
      
      if (updates.store !== undefined) {
        formUpdates.destination_store = updates.store;
      }
      
      if (updates.ordering_store !== undefined) {
        formUpdates.ordering_store = updates.ordering_store;
      }
      
      if (updates.ordering_plant !== undefined) {
        formUpdates.ordering_plant = updates.ordering_plant;
      }
      
      if (updates.transfer_route !== undefined) {
        formUpdates.transfer_route = updates.transfer_route;
      }
      
      if (updates.carrier !== undefined) {
        formUpdates.carrier = updates.carrier;
      }
      
      if (updates.crossDock !== undefined) {
        formUpdates.crossDock = updates.crossDock;
      }
      
      if (updates.crossDockDestination !== undefined) {
        formUpdates.crossDockDestination = updates.crossDockDestination;
      }
      
      if (updates.receiverNo !== undefined) {
        formUpdates.receiverNo = updates.receiverNo;
      }
      
      if (updates.etaDate !== undefined) {
        formUpdates.etaDate = updates.etaDate;
      }
      
      if (updates.crossDockConfirmation !== undefined) {
        formUpdates.crossDockConfirmation = updates.crossDockConfirmation;
      }
      
      if (updates.scheduleArrival !== undefined) {
        formUpdates.scheduleArrival = updates.scheduleArrival;
      }
      
      // Apply form updates
      Object.entries(formUpdates).forEach(([key, value]) => {
        form.setValue(key, value);
      });
      
      return newData;
    });
  }, [form]);

  const resetRoutingData = useCallback(() => {
    setRoutingData({
      transfer_route: 'store->store',
      crossDock: 'No',
    });
  }, []);

  return {
    routingData,
    updateRoutingData,
    resetRoutingData,
  };
}