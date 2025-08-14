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

  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const baseList = React.useMemo(() => {
    if (elevated) return STORES;                        // ALL STORES for elevated users
    if (!filterPlant) return STORES;                    // fallback (no filter)
    return STORES.filter(s => s.plant === filterPlant); // restricted list for normal users
  }, [elevated, filterPlant]);

  const results = React.useMemo(() => {
    return q ? searchStores(q).filter(s => baseList.includes(s)) : baseList;
  }, [q, baseList]);

  const commit = (raw: string) => {
    const normalized = normalizeStoreName(raw);
    if (normalized) onChange(normalized);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => { 
            setQ(e.target.value); 
            onChange(e.target.value); 
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => { 
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(q || value);
            }
          }}
          className="w-full"
        />
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-background shadow-lg">
            {results.map(r => (
              <button
                type="button"
                key={r.name}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                onClick={() => { 
                  onChange(r.name); 
                  setQ(''); 
                  setOpen(false); 
                }}
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
          ? 'Elevated access: all stores visible. Manual entry allowed; must normalize to "City 0XX".'
          : 'Manual entry allowed; must match your plant and normalize to "City 0XX".'}
      </div>
    </div>
  );
}