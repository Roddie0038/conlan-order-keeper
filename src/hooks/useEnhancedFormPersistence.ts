// kill-switch: no-op autosave hook
// Purpose: stop ALL autosave side-effects (timers, writes, toasts) while keeping type/usage compatibility.

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type AnyRecord = Record<string, unknown>;

// Keep the name so all existing imports continue to work.
// Keep the signature permissive; callers can pass anything and still compile.
export function useEnhancedFormPersistence<T extends AnyRecord = AnyRecord>(
  _formData?: T,
  _setFormData?: (next: T | ((prev: T) => T)) => void,
  _options?: {
    formType?: string;
    debounceMs?: number;
    excludeFields?: string[];
    onRestore?: () => void;
    enabled?: boolean;
    autoSaveInterval?: number;
    maxAge?: number;
  }
): any {
  // Return a stable, read-only shape most UIs expect.
  const noop = () => {};
  return {
    saveStatus: 'idle' as SaveStatus,
    lastSaved: null as Date | null,
    isRestoring: false,
    saveCount: 0,
    onClearData: noop,
    onSaveNow: noop,
    // add common fields some callers might read:
    error: null,
    isDirty: false,
  };
}

export default useEnhancedFormPersistence;
