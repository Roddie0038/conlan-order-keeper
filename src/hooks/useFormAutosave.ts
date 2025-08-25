import { useEffect, useRef } from 'react';
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

// Enhanced autosave hook for React Hook Form integration with server-side persistence
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
  const formValues = form.watch();
  const hasInitialized = useRef(false);
  
  // Get form type mapping
  const mapping = FORM_TYPE_MAPPINGS[formType];
  if (!mapping) {
    throw new Error(`Unknown form type: ${formType}`);
  }

  // Use server-side draft persistence with fallback values
  const draft = useServerOrderDraft({
    formType: mapping.formType,
    subType: mapping.subType,
    store: options?.store || 'Unknown Store',
    plant: options?.plant || 'Unknown Plant',
    initialData: {},
    enabled: options?.enabled ?? true,
    excludeFields: options?.excludeFields,
    debounceMs: 1500, // Slower debounce to prevent save storms
    onRestore: (data) => {
      if (data && typeof data === 'object') {
        form.reset(data);
        options?.onRestore?.();
      }
    }
  });

  // Sync form values with draft system
  useEffect(() => {
    if (hasInitialized.current && formValues && Object.keys(formValues).length > 0) {
      draft.update(formValues);
    }
  }, [formValues, draft]);

  // Mark as initialized after first render to prevent unwanted resets
  useEffect(() => {
    hasInitialized.current = true;
  }, []);

  return {
    ...draft,
    // Legacy compatibility properties
    clearPersistedData: draft.discardDraft,
    hasPersistedData: draft.hasRestored,
    getPersistedDataInfo: () => draft.lastSaved ? { timestamp: draft.lastSaved } : null,
    isRestoring: !draft.hasRestored,
    ready: draft.hasRestored,
    didRestore: draft.hasRestored
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
    onRestore: (data) => {
      if (data && typeof data === 'object') {
        setFormData(data as T);
        options?.onRestore?.(data as T);
      }
    }
  });

  // Sync form data with draft system
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      draft.update(formData);
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