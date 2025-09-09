import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export function useFormSession<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  storageKey: string,
  debounceMs = 600
) {
  const t = useRef<any>(null);

  // Rehydrate once on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const values = JSON.parse(raw);
      form.reset(values, { keepDirty: true, keepTouched: true });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Save on changes (debounced)
  useEffect(() => {
    const sub = form.watch((values) => {
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => {
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(values ?? {}));
        } catch {}
      }, debounceMs);
    });
    return () => {
      sub.unsubscribe();
      if (t.current) clearTimeout(t.current);
    };
  }, [form, storageKey, debounceMs]);
}