import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldWrapper } from '@/components/common/forms/FormFieldWrapper';
import { PLANTS, STORES, storeToDefaultPlant } from '@/lib/stores';

interface PlantStoreSelectorProps {
  orderingStore: string;
  sourcePlant: string;
  fulfilledByPlant: string;
  isPlantToPlant: boolean;
  onOrderingStoreChange: (value: string) => void;
  onSourcePlantChange: (value: string) => void;
  onFulfilledByPlantChange: (value: string) => void;
  onModeChange: (isPlantToPlant: boolean) => void;
}

const NO_STORE_VALUE = 'NO_STORE_PLANT_TRANSFER';

export function PlantStoreSelector({
  orderingStore,
  sourcePlant,
  fulfilledByPlant,
  isPlantToPlant,
  onOrderingStoreChange,
  onSourcePlantChange,
  onFulfilledByPlantChange,
  onModeChange,
}: PlantStoreSelectorProps) {
  
  // Handle store selection and auto-populate fulfilled plant
  const handleStoreChange = (value: string) => {
    const isNoStore = value === NO_STORE_VALUE;
    
    onOrderingStoreChange(value);
    onModeChange(isNoStore);
    
    if (isNoStore) {
      // Clear fulfilled plant for plant-to-plant mode
      onFulfilledByPlantChange('');
    } else {
      // Auto-populate fulfilled plant based on store
      const storeName = value;
      const defaultPlant = storeToDefaultPlant(storeName);
      if (defaultPlant && !fulfilledByPlant) {
        onFulfilledByPlantChange(defaultPlant);
      }
    }
  };

  // Auto-populate fulfilled plant when store changes
  useEffect(() => {
    if (orderingStore && orderingStore !== NO_STORE_VALUE && !fulfilledByPlant) {
      const defaultPlant = storeToDefaultPlant(orderingStore);
      if (defaultPlant) {
        onFulfilledByPlantChange(defaultPlant);
      }
    }
  }, [orderingStore, fulfilledByPlant, onFulfilledByPlantChange]);

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      {isPlantToPlant && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
            Plant-to-Plant Transfer Mode
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFieldWrapper
          label="Ordering For Store / Plant"
          required
          error=""
          description="Select the store placing the order, or choose 'No Store' for a plant-to-plant transfer."
        >
          <Select value={orderingStore} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select store or plant transfer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_STORE_VALUE}>
                No Store (Plant Transfer)
              </SelectItem>
              {STORES.filter(store => store.code !== '000').map((store) => (
                <SelectItem key={store.code} value={store.name}>
                  {store.name} ({store.plant})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Fulfilled By Plant"
          required
          error=""
          description="Select the plant that will fulfill this order. Default is based on the store selection, but can be changed."
        >
          <Select value={fulfilledByPlant} onValueChange={onFulfilledByPlantChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select fulfilled by plant" />
            </SelectTrigger>
            <SelectContent>
              {PLANTS.map((plant) => (
                <SelectItem key={plant} value={plant}>
                  {plant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>

      {/* Source Plant for plant-to-plant transfers */}
      {isPlantToPlant && (
        <FormFieldWrapper
          label="Source Plant"
          required
          error=""
          description="Select the originating plant for this transfer."
        >
          <Select value={sourcePlant} onValueChange={onSourcePlantChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source plant" />
            </SelectTrigger>
            <SelectContent>
              {PLANTS.map((plant) => (
                <SelectItem key={plant} value={plant}>
                  {plant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      )}
    </div>
  );
}