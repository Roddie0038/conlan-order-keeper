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
  const hasInitialized = useRef(false);
  const suspendedRef = useRef(false);
  const lastSavedPayloadRef = useRef<any | null>(null);

  // watch full form but we'll sanitize + compare before saving
  const formValues = form.watch();

  // Fields the server mutates or that are non-deterministic – never include in autosave
  const OMIT_KEYS = new Set([
    'id','created_at','createdAt','updated_at','updatedAt','version',
    'serverVersion','telemetry','lastSavedAt','_meta','_internal'
  ]);

  const stripServerFields = useCallback(function strip(obj: any): any {
    if (obj == null) return obj;
    if (Array.isArray(obj)) return obj.map(strip);
    if (typeof obj === 'object') {
      const out: Record<string, any> = {};
      for (const k of Object.keys(obj)) {
        if (OMIT_KEYS.has(k)) continue;
        out[k] = strip(obj[k]);
      }
      return out;
    }
    return obj;
  }, []);

  const userEditable = useMemo(() => stripServerFields(formValues), [formValues, stripServerFields]);
  
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
    debounceMs: 1000, // Controlled via our own debounce
    useTempKey: true, // Enable temp->final key migration
    onRestore: (data) => {
      if (data && typeof data === 'object') {
        // Strip server-managed fields to avoid re-dirtying form
        const sanitized = stripServerFields(data);
        form.reset(sanitized);
        options?.onRestore?.();
      }
    }
  });

  // Debounced saver (1s). NOTE: cancel on unmount.
  const debouncedSave = useMemo(() => debounce((payload: any) => {
    draft.update(payload);
    lastSavedPayloadRef.current = payload;
  }, 1000), [draft]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Core autosave logic
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      lastSavedPayloadRef.current = userEditable;
      return;
    }
    if (suspendedRef.current) return;               // paused during submit/template
    if (isEqual(lastSavedPayloadRef.current, userEditable)) return; // nothing meaningful changed
    debouncedSave(userEditable);                    // queue one save
  }, [userEditable, debouncedSave]);

  // Public controls for callers (submit/template flows)
  const suspendAutosave = useCallback(() => { suspendedRef.current = true; }, []);
  const resumeAutosave  = useCallback(() => { suspendedRef.current = false; }, []);
  const flushAutosave   = useCallback(async () => {
    // lodash debounce v4 exposes .flush(); if not, cancel+manual write
    // @ts-ignore
    if (debouncedSave.flush) debouncedSave.flush();
  }, [debouncedSave]);

  return {
    ...draft,
    // Legacy compatibility properties
    clearPersistedData: draft.discardDraft,
    hasPersistedData: draft.hasRestored,
    getPersistedDataInfo: () => draft.lastSaved ? { timestamp: draft.lastSaved } : null,
    isRestoring: !draft.hasRestored,
    ready: draft.hasRestored,
    didRestore: draft.hasRestored,
    // New autosave controls
    suspendAutosave,
    resumeAutosave,
    flushAutosave
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