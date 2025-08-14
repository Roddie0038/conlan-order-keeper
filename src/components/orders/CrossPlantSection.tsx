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

export const CrossPlantSection: React.FC<Props> = ({ enabled, value, onChange, onSoftConflict }) => {
  if (!enabled) return null;

  const [storeQuery, setStoreQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const results = searchStores(storeQuery);

  const setStore = (raw: string) => {
    const normalized = normalizeStoreName(raw);
    onChange({
      ...value,
      ordering_store: normalized,
      ordering_plant: normalized ? (storeToDefaultPlant(normalized) || value.ordering_plant) : null,
    });
    setShowResults(false);
  };

  const validate = () => {
    const same = value.ordering_plant && value.destination_plant && value.ordering_plant === value.destination_plant;
    onSoftConflict?.(!!same);
  };

  React.useEffect(validate, [value.ordering_plant, value.destination_plant, onSoftConflict]);

  return (
    <Card className="space-y-4 p-6">
      <div className="text-lg font-semibold text-foreground">Cross-Plant Order Configuration</div>
      <div className="text-sm text-muted-foreground">
        Configure source and destination for cross-plant orders (Operations Manager only)
      </div>

      {/* Source Store */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Ordering as (Source Store)</label>
        <div className="relative">
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Type city or code, e.g., Fort Worth 022"
            value={storeQuery}
            onChange={(e) => {
              setStoreQuery(e.target.value);
              setShowResults(true);
            }}
            onBlur={() => {
              // Delay to allow click on results
              setTimeout(() => setShowResults(false), 150);
              if (storeQuery) setStore(storeQuery);
            }}
            onFocus={() => setShowResults(true)}
          />
          {showResults && storeQuery && results.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
              {results.map(r => (
                <button
                  key={r.name}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-foreground hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={() => { 
                    setStoreQuery(r.name); 
                    setStore(r.name); 
                  }}
                >
                  {r.name} — {r.plant}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Manual entry allowed but must normalize to <em>City XXX</em> format.
          {value.ordering_store ? (
            <span className="ml-2 text-emerald-600">✓ {value.ordering_store}</span>
          ) : null}
        </div>
      </div>

      {/* Source Plant */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Fulfillment Plant (Source)</label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={value.ordering_plant ?? ''}
          onChange={(e) => onChange({ ...value, ordering_plant: e.target.value || null })}
        >
          <option value="">Select source plant…</option>
          {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Destination Plant */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Ship To Plant (Destination)</label>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={value.destination_plant ?? ''}
          onChange={(e) => onChange({ ...value, destination_plant: e.target.value || null })}
        >
          <option value="">Select destination plant…</option>
          {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(value.ordering_plant && value.destination_plant && value.ordering_plant === value.destination_plant) && (
          <div className="rounded-md border border-yellow-500 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-400 dark:bg-yellow-950 dark:text-yellow-200">
            ⚠️ Source and destination plants are the same. Continue if intentional.
          </div>
        )}
      </div>
    </Card>
  );
};