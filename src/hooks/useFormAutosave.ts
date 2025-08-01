import { useEffect, useRef } from 'react';
import { useUniversalFormPersistence } from './useUniversalFormPersistence';

// Convenience hook for React Hook Form integration
export function useFormAutosave<T extends Record<string, any>>(
  form: any, // React Hook Form instance
  formType: 'order' | 'complaint' | 'warranty' | 'mto' | 'wheel-powder-coating',
  options?: {
    enabled?: boolean;
    excludeFields?: string[];
    onRestore?: () => void;
  }
) {
  const formValues = form.watch();
  const hasInitialized = useRef(false);
  
  const persistence = useUniversalFormPersistence(
    formValues,
    (data) => {
      if (typeof data === 'function') {
        const newData = data(formValues);
        form.reset(newData);
      } else {
        form.reset(data);
      }
    },
    {
      formType,
      enabled: options?.enabled ?? true,
      excludeFields: options?.excludeFields,
      onRestore: options?.onRestore
    }
  );

  // Mark as initialized after first render to prevent unwanted resets
  useEffect(() => {
    hasInitialized.current = true;
  }, []);

  return persistence;
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
  }
) {
  return useUniversalFormPersistence(
    formData,
    setFormData,
    {
      formType,
      enabled: options?.enabled ?? true,
      excludeFields: options?.excludeFields,
      onRestore: options?.onRestore
    }
  );
}