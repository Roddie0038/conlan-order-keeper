import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Options = {
  formType: string;
  userId: string | null;
  enabled?: boolean;
  debounceMs?: number;
  maxAgeMs?: number;
};

type PersistPayload = Record<string, unknown>;
const now = () => Date.now();
const safeParse = <T,>(raw: string | null): T | null => { if (!raw) return null; try { return JSON.parse(raw) as T; } catch { return null; } };

export function useEnhancedFormPersistence<T extends PersistPayload>(
  initial: T,
  { formType, userId, enabled = true, debounceMs = 800, maxAgeMs }: Options
) {
  const [state, setState] = useState<T>(initial);
  const saveTimer = useRef<number | null>(null);
  const restoredRef = useRef(false);

  const storageKey = useMemo(() => {
    if (!enabled || !formType || !userId) return null;
    return `draft:new-order:${formType}:${userId}`;
  }, [enabled, formType, userId]);

  const clearTimer = useCallback(() => {
    if (saveTimer.current) { window.clearTimeout(saveTimer.current); saveTimer.current = null; }
  }, []);

  const saveNow = useCallback((payload: T) => {
    if (!enabled || !storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ savedAt: now(), payload })); } catch {}
  }, [enabled, storageKey]);

  const saveDebounced = useCallback((payload: T) => {
    if (!enabled || !storageKey) return;
    clearTimer();
    saveTimer.current = window.setTimeout(() => saveNow(payload), debounceMs) as unknown as number;
  }, [enabled, storageKey, debounceMs, clearTimer, saveNow]);

  useEffect(() => {
    if (!enabled || !storageKey || restoredRef.current) return;
    const wrapped = safeParse<{ savedAt: number; payload: T }>(localStorage.getItem(storageKey));
    if (wrapped?.payload) {
      const ageOk = typeof maxAgeMs === "number" ? (now() - wrapped.savedAt) <= maxAgeMs : true;
      if (ageOk) setState((prev) => ({ ...prev, ...wrapped.payload }));
    }
    restoredRef.current = true;
  }, [enabled, storageKey, maxAgeMs]);

  useEffect(() => {
    if (!enabled || !storageKey) return;
    saveDebounced(state);
    return () => clearTimer();
  }, [state, enabled, storageKey, saveDebounced, clearTimer]);

  const update = useCallback((patch: Partial<T>) => setState((s) => ({ ...s, ...patch })), []);
  const clearDraft = useCallback(() => { if (storageKey) try { localStorage.removeItem(storageKey); } catch {} }, [storageKey]);

  return { value: state, setValue: setState, update, clearDraft };
}