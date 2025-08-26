import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldWrapper } from '@/components/common/forms/FormFieldWrapper';
import { PLANTS, STORES } from '@/lib/stores';

interface PlantStoreSelectorProps {
  orderingStore: string;
  sourcePlant: string;
  onOrderingStoreChange: (value: string) => void;
  onSourcePlantChange: (value: string) => void;
}

export function PlantStoreSelector({
  orderingStore,
  sourcePlant,
  onOrderingStoreChange,
  onSourcePlantChange,
}: PlantStoreSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormFieldWrapper
        label="Ordering For Store"
        required
        error=""
      >
        <Select value={orderingStore} onValueChange={onOrderingStoreChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select store placing the order" />
          </SelectTrigger>
          <SelectContent>
            {STORES.filter(store => store.code !== '000').map((store) => (
              <SelectItem key={store.code} value={store.name}>
                {store.name} ({store.plant})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Source Plant"
        required
        error=""
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
    </div>
  );
}