import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasFullStoreAccess } from '@/lib/roles';
import { STORES, searchStores, normalizeStoreName } from '@/lib/stores';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  value: string;
  onChange: (next: string) => void;
  // When non-elevated, you may pass a plant to filter; elevated ignores it.
  filterPlant?: string | null;
  label?: string;
  placeholder?: string;
  className?: string;
};

export default function StoreSelector({ 
  value, 
  onChange, 
  filterPlant, 
  label = 'Store', 
  placeholder = 'Select or type a store…',
  className = ''
}: Props) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);

  // Local typing buffer; null => show committed `value`
  const [q, setQ] = React.useState<string | null>(null);
  const display = q ?? value ?? '';

  // Base list (filtered for non-elevated users)
  const baseList = React.useMemo(() => {
    if (elevated) return STORES;                        // ALL STORES for elevated users
    if (!filterPlant) return STORES;                    // fallback
    return STORES.filter(s => s.plant === filterPlant); // restricted for normal users
  }, [elevated, filterPlant]);

  const results = React.useMemo(() => {
    const term = (q ?? '').trim().toLowerCase();
    if (!term) return baseList;
    // search inside the current base list (avoids showing stores user shouldn't see)
    return baseList.filter(r => r.searchable.includes(term));
  }, [q, baseList]);

  const [open, setOpen] = React.useState(false);

  function commit(raw: string) {
    const t = (raw || '').trim();

    // Allow "unassigned" keyword -> Unassigned 000 (passes City 0XX rule)
    if (t.toLowerCase() === 'unassigned' || t.toLowerCase() === 'unassigned 000') {
      onChange('Unassigned 000');
      setOpen(false);
      setQ(null);
      return;
    }

    const normalized = normalizeStoreName(t);
    if (normalized) {
      onChange(normalized);
      setOpen(false);
      setQ(null);
      return;
    }

    // Not normalized -> keep q visible, do not commit
    setQ(t);
    setOpen(true);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={display}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(display);
            }
          }}
          className="w-full"
        />

        {/* Suggestions */}
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-background shadow-lg">
            {/* Optional "use typed value" if user entered something not yet normalized */}
            {q && (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                onClick={() => commit(display)}
              >
                Use "{display}"
              </button>
            )}
            {results.map(r => (
              <button
                type="button"
                key={r.name}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                onClick={() => commit(r.name)}
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-muted-foreground text-xs">{r.plant}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {elevated
          ? 'Elevated access: all stores visible. Manual entry allowed; type a city or code and press Enter. Tip: type "unassigned".'
          : 'Manual entry allowed; must match your plant and normalize to "City 0XX".'}
      </div>

      {/* Inline nudge if the text isn't normalized yet */}
      {q && !normalizeStoreName(q) && (
        <div className="text-xs text-amber-700">Not recognized yet. Press Enter to try normalize or type "unassigned".</div>
      )}
    </div>
  );
}