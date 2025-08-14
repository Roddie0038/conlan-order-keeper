// src/components/orders/OrderSummaryPreview.tsx
import React from 'react';

type Cross = {
  ordering_store: string | null;
  ordering_plant: string | null;
  destination_plant: string | null;
};

type Legacy = {
  store: string | null;
  plant: string | null;
};

type Props = {
  enabled: boolean;
  cross: Cross;
  legacy: Legacy;
  defaultOpen?: boolean;
};

export default function OrderSummaryPreview({ enabled, cross, legacy, defaultOpen = false }: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (!enabled) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <button
        type="button"
        className="rounded-md border border-border bg-background px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setOpen(s => !s)}
      >
        {open ? 'Hide' : 'Show'} Order Summary
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <div>
            <div className="font-medium text-foreground">Ordering as (Source Store)</div>
            <div className="text-muted-foreground">{cross.ordering_store || '—'}</div>
          </div>
          <div>
            <div className="font-medium text-foreground">Fulfillment Plant (Source)</div>
            <div className="text-muted-foreground">{cross.ordering_plant || '—'}</div>
          </div>
          <div>
            <div className="font-medium text-foreground">Ship To Plant (Destination)</div>
            <div className="text-muted-foreground">{cross.destination_plant || '—'}</div>
          </div>
          <div className="md:col-span-2 mt-2 border-t border-border pt-2">
            <div className="font-medium text-foreground">Legacy Destination (compat)</div>
            <div className="text-muted-foreground">
              Store: {legacy.store || '—'} &nbsp;•&nbsp; Plant: {legacy.plant || '—'}
            </div>
          </div>
          {cross.ordering_plant && cross.destination_plant && cross.ordering_plant !== cross.destination_plant && (
            <div className="md:col-span-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200">
              ✓ Cross-plant route: {cross.ordering_plant} → {cross.destination_plant}
            </div>
          )}
        </div>
      )}
    </div>
  );
}