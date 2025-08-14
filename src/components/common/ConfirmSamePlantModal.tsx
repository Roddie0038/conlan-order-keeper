// src/components/common/ConfirmSamePlantModal.tsx
import React from 'react';

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  source?: string | null;
  destination?: string | null;
};

export default function ConfirmSamePlantModal({ open, onCancel, onConfirm, source, destination }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
        <div className="text-lg font-semibold text-foreground">Confirm Same-Plant Order</div>
        <p className="mt-2 text-sm text-muted-foreground">
          The source and destination plants are the same:
        </p>
        <div className="mt-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
          {source || '—'} → {destination || '—'}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This is unusual for cross-plant routing. Are you sure you want to continue?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button 
            className="rounded-md border border-border bg-background px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="rounded-md border border-primary bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 transition-colors" 
            onClick={onConfirm}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}