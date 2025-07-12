import { useEffect, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';
import { toast } from '@/hooks/use-toast';

interface CustomPersistenceOptions {
  storageKey: string;
  debounceMs?: number;
  excludeFields?: string[];
  onRestore?: () => void;
  enabled?: boolean;
}

export function useCustomFormPersistence<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: CustomPersistenceOptions
) {
  const {
    storageKey,
    debounceMs = 1000,
    excludeFields = [],
    onRestore,
    enabled = true
  } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const hasRestoredRef = useRef(false);
  
  // Debounce form values to avoid excessive saves
  const debouncedValues = useDebounce(formData, debounceMs);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled || hasRestoredRef.current) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Only restore if there's meaningful data
        const hasData = Object.entries(parsedData.data || {}).some(([key, value]) => 
          !excludeFields.includes(key) && 
          value && 
          value !== '' && 
          value !== false &&
          value !== 0
        );

        if (hasData && parsedData.data) {
          setIsRestoring(true);
          
          // Update form data with saved data
          setFormData(parsedData.data);
          
          setLastSaved(new Date(parsedData.timestamp));
          
          // Show restoration feedback
          toast({
            title: "Form Data Restored",
            description: `Your previous work from ${new Date(parsedData.timestamp).toLocaleString()} has been restored.`,
          });

          onRestore?.();
          
          setTimeout(() => setIsRestoring(false), 500);
        }
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
      localStorage.removeItem(storageKey);
    }
    
    hasRestoredRef.current = true;
  }, [enabled, storageKey, setFormData, excludeFields, onRestore]);

  // Save form data when it changes (debounced)
  useEffect(() => {
    if (!enabled || isRestoring || !hasRestoredRef.current) return;

    // Check if form has meaningful data
    const hasData = Object.entries(debouncedValues).some(([key, value]) => 
      !excludeFields.includes(key) && 
      value && 
      value !== '' && 
      value !== false &&
      value !== 0
    );

    if (hasData) {
      try {
        const dataToSave = {
          data: debouncedValues,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save form data:', error);
      }
    }
  }, [debouncedValues, enabled, isRestoring, storageKey, excludeFields]);

  const clearPersistedData = () => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      
      toast({
        title: "Form Cleared",
        description: "All form data has been cleared and removed from storage.",
      });
    } catch (error) {
      console.error('Failed to clear persisted data:', error);
    }
  };

  const hasPersistedData = () => {
    try {
      const savedData = localStorage.getItem(storageKey);
      return !!savedData;
    } catch {
      return false;
    }
  };

  return {
    lastSaved,
    isRestoring,
    clearPersistedData,
    hasPersistedData: hasPersistedData()
  };
}