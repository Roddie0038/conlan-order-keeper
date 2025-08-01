import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UniversalPersistenceOptions {
  formType: 'order' | 'complaint' | 'warranty' | 'mto' | 'wheel-powder-coating';
  debounceMs?: number;
  excludeFields?: string[];
  onRestore?: (data: any) => void;
  enabled?: boolean;
  autoSaveInterval?: number; // Additional interval-based saving
}

interface SavedFormData {
  data: any;
  timestamp: string;
  formType: string;
  userId?: string;
  version: string; // For future compatibility
}

export function useUniversalFormPersistence<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: UniversalPersistenceOptions
) {
  const { user } = useAuth();
  const {
    formType,
    debounceMs = 2000,
    excludeFields = [],
    onRestore,
    enabled = true,
    autoSaveInterval = 30000 // Auto-save every 30 seconds
  } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const hasRestoredRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate unique storage key per user and form type
  const storageKey = `auto-save-${formType}-${user?.id || 'anonymous'}`;
  
  // Debounce form values for reactive saving
  const debouncedValues = useDebounce(formData, debounceMs);

  // Helper function to check if form has meaningful data
  const hasMeaningfulData = useCallback((data: any): boolean => {
    return Object.entries(data).some(([key, value]) => {
      if (excludeFields.includes(key)) return false;
      
      // Check for meaningful values
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'boolean' && value === false) return false;
      if (typeof value === 'number' && value === 0) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      
      return true;
    });
  }, [excludeFields]);

  // Save function
  const saveFormData = useCallback((data: any, source: 'debounce' | 'interval' | 'manual' = 'debounce') => {
    if (!enabled || isRestoring || !hasRestoredRef.current) return;

    if (hasMeaningfulData(data)) {
      try {
        const saveData: SavedFormData = {
          data,
          timestamp: new Date().toISOString(),
          formType,
          userId: user?.id,
          version: '1.0'
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        setLastSaved(new Date());
        setSaveCount(prev => prev + 1);
        
        console.log(`✅ Auto-save completed (${source}):`, {
          formType,
          timestamp: saveData.timestamp,
          saveCount: saveCount + 1,
          hasData: hasMeaningfulData(data)
        });
      } catch (error) {
        console.error('❌ Failed to save form data:', error);
        // If localStorage is full, try to clean up old data
        try {
          // Remove old auto-save entries
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('auto-save-') && key !== storageKey) {
              const item = localStorage.getItem(key);
              if (item) {
                try {
                  const parsed = JSON.parse(item);
                  const itemDate = new Date(parsed.timestamp);
                  const daysDiff = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
                  if (daysDiff > 7) { // Remove items older than 7 days
                    localStorage.removeItem(key);
                  }
                } catch (e) {
                  localStorage.removeItem(key);
                }
              }
            }
          });
          // Try saving again
          const retryData: SavedFormData = {
            data,
            timestamp: new Date().toISOString(),
            formType,
            userId: user?.id,
            version: '1.0'
          };
          localStorage.setItem(storageKey, JSON.stringify(retryData));
          setLastSaved(new Date());
        } catch (cleanupError) {
          console.error('❌ Failed to save even after cleanup:', cleanupError);
        }
      }
    }
  }, [enabled, isRestoring, hasRestoredRef.current, storageKey, formType, user?.id, hasMeaningfulData, saveCount]);

  // Load saved data on mount
  useEffect(() => {
    if (!enabled || hasRestoredRef.current) return;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData: SavedFormData = JSON.parse(savedData);
        
        // Validate saved data
        if (parsedData.formType === formType && parsedData.data && hasMeaningfulData(parsedData.data)) {
          setIsRestoring(true);
          
          // Restore form data
          setFormData(parsedData.data);
          setLastSaved(new Date(parsedData.timestamp));
          
          // Show restoration feedback
          toast({
            title: "Form Data Restored",
            description: `Your previous work from ${new Date(parsedData.timestamp).toLocaleString()} has been restored.`,
          });

          onRestore?.(parsedData.data);
          
          console.log(`🔄 Form data restored for ${formType}:`, {
            timestamp: parsedData.timestamp,
            hasData: hasMeaningfulData(parsedData.data)
          });
          
          setTimeout(() => setIsRestoring(false), 500);
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore form data:', error);
      localStorage.removeItem(storageKey);
    }
    
    hasRestoredRef.current = true;
  }, [enabled, storageKey, formType, setFormData, onRestore, hasMeaningfulData]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || isRestoring || !hasRestoredRef.current) return;
    saveFormData(debouncedValues, 'debounce');
  }, [debouncedValues, enabled, isRestoring, saveFormData]);

  // Interval-based auto-save
  useEffect(() => {
    if (!enabled || !autoSaveInterval) return;

    intervalRef.current = setInterval(() => {
      saveFormData(formData, 'interval');
    }, autoSaveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, autoSaveInterval, formData, saveFormData]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (hasMeaningfulData(formData)) {
        saveFormData(formData, 'manual');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, formData, saveFormData, hasMeaningfulData]);

  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setSaveCount(0);
      
      toast({
        title: "Form Cleared",
        description: "All form data has been cleared and removed from storage.",
      });
      
      console.log(`🗑️ Cleared persisted data for ${formType}`);
    } catch (error) {
      console.error('❌ Failed to clear persisted data:', error);
    }
  }, [storageKey, formType]);

  const hasPersistedData = useCallback((): boolean => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) return false;
      
      const parsedData: SavedFormData = JSON.parse(savedData);
      return parsedData.formType === formType && hasMeaningfulData(parsedData.data);
    } catch {
      return false;
    }
  }, [storageKey, formType, hasMeaningfulData]);

  const getPersistedDataInfo = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) return null;
      
      const parsedData: SavedFormData = JSON.parse(savedData);
      return {
        timestamp: new Date(parsedData.timestamp),
        formType: parsedData.formType,
        hasData: hasMeaningfulData(parsedData.data)
      };
    } catch {
      return null;
    }
  }, [storageKey, hasMeaningfulData]);

  // Manual save function for critical moments
  const saveNow = useCallback(() => {
    saveFormData(formData, 'manual');
  }, [formData, saveFormData]);

  return {
    lastSaved,
    isRestoring,
    saveCount,
    clearPersistedData,
    hasPersistedData: hasPersistedData(),
    getPersistedDataInfo,
    saveNow
  };
}