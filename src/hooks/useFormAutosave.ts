import { useEffect, useMemo, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';
import isEqual from 'fast-deep-equal';
import { useServerOrderDraft } from './useServerOrderDraft';
import { FormType, SubType } from '@/utils/draftKeys';

// Form type mappings for backwards compatibility
const FORM_TYPE_MAPPINGS: Record<string, { formType: FormType; subType: SubType }> = {
  'order': { formType: 'standard', subType: 'transfer' },
  'complaint': { formType: 'standard', subType: 'transfer' }, // Complaints use standard form
  'warranty': { formType: 'warranty', subType: 'order' },
  'mto': { formType: 'mto', subType: 'order' },
  'wheel-powder-coating': { formType: 'wheel', subType: 'powder-coating' }
};

// NO-OP autosave hook - autosave disabled per user request
export function useFormAutosave<T extends Record<string, any>>(
  form: any, // React Hook Form instance
  formType: 'order' | 'complaint' | 'warranty' | 'mto' | 'wheel-powder-coating',
  options?: {
    enabled?: boolean;
    excludeFields?: string[];
    onRestore?: () => void;
    store?: string;
    plant?: string;
  }
) {
  // Return no-op implementation - autosave functionality disabled
  return {
    lastSaved: null,
    isRestoring: false,
    clearPersistedData: () => {},
    ready: true,
    didRestore: false,
    saveStatus: 'idle' as const,
    discardDraft: () => {},
    saveNow: () => Promise.resolve(),
    isSubmittingRef: { current: false },
    markSubmitting: () => {},
    clearSubmitting: () => {},
    suspendAutosave: () => {},
    resumeAutosave: () => {},
    flushAutosave: () => Promise.resolve(),
    hasPersistedData: false,
    getPersistedDataInfo: () => null,
    hasRestored: false
  };
}

// Legacy compatibility hook for existing forms using useState
export function useStatefulFormAutosave<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  formType: 'order' | 'complaint' | 'warranty' | 'mto' | 'wheel-powder-coating',
  options?: {
    enabled?: boolean;
    excludeFields?: string[];
    onRestore?: (data: T) => void;
    store?: string;
    plant?: string;
  }
) {
  // Get form type mapping
  const mapping = FORM_TYPE_MAPPINGS[formType];
  if (!mapping) {
    throw new Error(`Unknown form type: ${formType}`);
  }

  const draft = useServerOrderDraft({
    formType: mapping.formType,
    subType: mapping.subType,
    store: options?.store || 'Unknown Store',
    plant: options?.plant || 'Unknown Plant',
    initialData: formData,
    enabled: options?.enabled ?? true,
    excludeFields: options?.excludeFields,
    debounceMs: 1000,
    useTempKey: true, // Enable temp->final key migration
    onRestore: (data) => {
      if (data && typeof data === 'object') {
        setFormData(data as T);
        options?.onRestore?.(data as T);
      }
    }
  });

  // Sync form data with draft system with deep comparison
  const lastSavedStatefulRef = useRef<any | null>(null);
  
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      // Strip server fields and compare
      const userEditableData = Object.fromEntries(
        Object.entries(formData).filter(([key]) => !['id','created_at','createdAt','updated_at','updatedAt','version'].includes(key))
      );
      
      if (!isEqual(lastSavedStatefulRef.current, userEditableData)) {
        draft.update(userEditableData);
        lastSavedStatefulRef.current = userEditableData;
      }
    }
  }, [formData, draft]);

  return {
    ...draft,
    // Legacy compatibility properties
    clearPersistedData: draft.discardDraft,
    hasPersistedData: draft.hasRestored,
    getPersistedDataInfo: () => draft.lastSaved ? { timestamp: draft.lastSaved } : null,
    isRestoring: !draft.hasRestored,
    ready: draft.hasRestored,
    didRestore: draft.hasRestored,
    saveCount: 0 // Mock value for compatibility
  };
}