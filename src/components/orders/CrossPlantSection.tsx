// src/components/orders/CrossPlantSection.tsx
import React from 'react';
import { PLANTS, searchStores, normalizeStoreName, storeToDefaultPlant } from '@/lib/stores';
import { Card } from '@/components/ui/card';
type Props = {
  enabled: boolean; // elevated roles only
  value: {
    ordering_store: string | null;
    ordering_plant: string | null;
    destination_plant: string | null;
  };
  onChange: (next: Props['value']) => void;
  onSoftConflict?: (samePlant: boolean) => void;
};
export const CrossPlantSection: React.FC<Props> = ({
  enabled,
  value,
  onChange,
  onSoftConflict
}) => {
  if (!enabled) return null;
  const [storeQuery, setStoreQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const results = searchStores(storeQuery);
  const setStore = (raw: string) => {
    const normalized = normalizeStoreName(raw);
    onChange({
      ...value,
      ordering_store: normalized,
      ordering_plant: normalized ? storeToDefaultPlant(normalized) || value.ordering_plant : null
    });
    setShowResults(false);
  };
  const validate = () => {
    const same = value.ordering_plant && value.destination_plant && value.ordering_plant === value.destination_plant;
    onSoftConflict?.(!!same);
  };
  React.useEffect(validate, [value.ordering_plant, value.destination_plant, onSoftConflict]);
  return;
};