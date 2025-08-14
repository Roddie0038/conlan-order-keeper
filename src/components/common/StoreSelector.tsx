import React from 'react';
import { createPortal } from 'react-dom';
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
  allowUnassigned?: boolean;  // NEW: whether to allow "Unassigned 000"
};

export default function StoreSelector({
  value,
  onChange,
  filterPlant,
  label = 'Store',
  placeholder = 'Select or type a store…',
  className = '',
  allowUnassigned = false
}: Props) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = React.useState(false);
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

  // Compute dropdown position under input (fixed; avoids clipping)
  const [rect, setRect] = React.useState<{top:number,left:number,width:number} | null>(null);
  const updatePosition = React.useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
  }, []);
  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener('scroll', onWin, true);
    window.addEventListener('resize', onWin, true);
    return () => {
      window.removeEventListener('scroll', onWin, true);
      window.removeEventListener('resize', onWin, true);
    };
  }, [open, updatePosition]);

  function commit(raw: string) {
    const t = (raw || '').trim();

    // Allow "unassigned" keyword -> Unassigned 000 (only if allowUnassigned is true)
    if (allowUnassigned && (t.toLowerCase() === 'unassigned' || t.toLowerCase() === 'unassigned 000')) {
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
      <Input
        ref={inputRef}
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

      {/* Portal dropdown */}
      {open && rect && results.length > 0 && createPortal(
        <div
          style={{ 
            position: 'fixed', 
            top: rect.top, 
            left: rect.left, 
            width: rect.width, 
            zIndex: 9999 
          }}
          className="max-h-[70vh] overflow-auto rounded-md border bg-background shadow-xl"
        >
          {q && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
              onMouseDown={(e) => e.preventDefault()}
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
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(r.name)}
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-muted-foreground text-xs">{r.plant}</div>
            </button>
          ))}
        </div>,
        document.body
      )}

      <div className="text-xs text-muted-foreground">
        {elevated
          ? `Elevated access: all stores visible. Manual entry allowed; type a city or code and press Enter. ${allowUnassigned ? 'Tip: type "unassigned".' : ''}`
          : 'Manual entry allowed; must match your plant and normalize to "City 0XX".'}
      </div>

      {/* Inline nudge if the text isn't normalized yet */}
      {q && !normalizeStoreName(q) && !allowUnassigned && (
        <div className="text-xs text-amber-700">Not recognized yet. Press Enter to try normalize.</div>
      )}
      
      {/* Show unassigned hint only when allowed */}
      {q && !normalizeStoreName(q) && allowUnassigned && (
        <div className="text-xs text-amber-700">Not recognized yet. Press Enter to try normalize or type "unassigned".</div>
      )}
    </div>
  );
}