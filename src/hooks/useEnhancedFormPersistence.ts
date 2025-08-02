import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { persistentStorageService } from '@/services/persistentStorageService';
import { sanitizeFormData, hasMeaningfulData, getDefaultExcludeFields } from '@/utils/formSanitization';

interface EnhancedPersistenceOptions {
  formType: 'order' | 'complaint' | 'warranty' | 'mto' | 'wheel-powder-coating';
  debounceMs?: number;
  excludeFields?: string[];
  onRestore?: (data: any) => void;
  enabled?: boolean;
  autoSaveInterval?: number;
  maxAge?: number; // Maximum age before expiry (default 1 hour)
}

export function useEnhancedFormPersistence<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: EnhancedPersistenceOptions
) {
  const { user } = useAuth();
  const {
    formType,
    debounceMs = 1000, // Faster debounce for better UX
    excludeFields = [],
    onRestore,
    enabled = true,
    autoSaveInterval = 30000,
    maxAge = 60 * 60 * 1000 // 1 hour
  } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const hasRestoredRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTabActiveRef = useRef(true);
  
  // Enhanced field exclusion list
  const allExcludeFields = [...getDefaultExcludeFields(), ...excludeFields];
  
  // Generate storage key
  const storageKey = user ? persistentStorageService.generateKey(
    user.store || 'unknown',
    user.email || 'anonymous',
    formType
  ) : null;
  
  // Debounce form values for reactive saving
  const debouncedValues = useDebounce(formData, debounceMs);

  // Track tab visibility for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Save function with enhanced security and error handling
  const saveFormData = useCallback(async (data: any, source: 'debounce' | 'interval' | 'manual' = 'debounce') => {
    if (!enabled || !storageKey || isRestoring || !hasRestoredRef.current || !user) return;

    // Sanitize and validate data
    const sanitizedData = sanitizeFormData(data, allExcludeFields);
    if (!hasMeaningfulData(sanitizedData)) return;

    try {
      await persistentStorageService.save(storageKey, sanitizedData, {
        store: user.store || 'unknown',
        user: user.email || 'anonymous',
        formType,
        version: '2.0'
      });

      setLastSaved(new Date());
      setSaveCount(prev => prev + 1);
      
      console.log(`✅ Enhanced auto-save completed (${source}):`, {
        formType,
        saveCount: saveCount + 1,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Enhanced auto-save failed:', error);
    }
  }, [enabled, storageKey, isRestoring, user, formType, allExcludeFields, saveCount]);

  // Load saved data on mount with enhanced validation
  useEffect(() => {
    if (!enabled || !storageKey || hasRestoredRef.current || !user) return;

    const loadSavedData = async () => {
      try {
        const savedData = await persistentStorageService.load(storageKey);
        
        if (savedData) {
          // Validate metadata
          if (!persistentStorageService.validateMetadata(savedData, user.store || 'unknown', user.email || 'anonymous', formType)) {
            console.log('🚫 Saved data metadata mismatch, ignoring');
            return;
          }

          // Check expiration
          if (persistentStorageService.isExpired(savedData, maxAge)) {
            console.log('⏰ Saved data expired, removing');
            await persistentStorageService.remove(storageKey);
            return;
          }

          // Validate and restore data
          if (hasMeaningfulData(savedData.data)) {
            setIsRestoring(true);
            
            // Restore form data
            setFormData(savedData.data);
            setLastSaved(new Date(savedData.meta.updatedAt));
            
            // Show restoration feedback
            const savedTime = new Date(savedData.meta.updatedAt).toLocaleString();
            toast({
              title: "Form Data Restored",
              description: `Your previous work from ${savedTime} has been restored.`,
            });

            onRestore?.(savedData.data);
            
            console.log(`🔄 Enhanced form data restored for ${formType}:`, {
              timestamp: savedData.meta.updatedAt,
              version: savedData.meta.version
            });
            
            setTimeout(() => setIsRestoring(false), 500);
          }
        }
      } catch (error) {
        console.error('❌ Failed to restore form data:', error);
        if (storageKey) {
          await persistentStorageService.remove(storageKey);
        }
      } finally {
        hasRestoredRef.current = true;
      }
    };

    loadSavedData();
  }, [enabled, storageKey, formType, setFormData, onRestore, maxAge, user]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || isRestoring || !hasRestoredRef.current) return;
    saveFormData(debouncedValues, 'debounce');
  }, [debouncedValues, enabled, isRestoring, saveFormData]);

  // Interval-based auto-save (only when tab is active)
  useEffect(() => {
    if (!enabled || !autoSaveInterval) return;

    intervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        saveFormData(formData, 'interval');
      }
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
      if (hasMeaningfulData(sanitizeFormData(formData, allExcludeFields))) {
        // Use synchronous approach for page unload
        navigator.sendBeacon && storageKey && saveFormData(formData, 'manual');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, formData, saveFormData, allExcludeFields, storageKey]);

  // Cross-tab coordination
  useEffect(() => {
    const handleFormDraftCleared = (event: CustomEvent) => {
      if (event.detail.key === storageKey) {
        setLastSaved(null);
        setSaveCount(0);
      }
    };

    window.addEventListener('formDraftCleared', handleFormDraftCleared as EventListener);
    return () => window.removeEventListener('formDraftCleared', handleFormDraftCleared as EventListener);
  }, [storageKey]);

  // Cleanup expired data on mount
  useEffect(() => {
    if (enabled) {
      persistentStorageService.cleanup(maxAge);
    }
  }, [enabled, maxAge]);

  const clearPersistedData = useCallback(async () => {
    if (!storageKey) return;

    try {
      await persistentStorageService.remove(storageKey);
      setLastSaved(null);
      setSaveCount(0);
      
      toast({
        title: "Form Cleared",
        description: "All form data has been cleared and removed from storage.",
      });
      
      console.log(`🗑️ Cleared enhanced persisted data for ${formType}`);
    } catch (error) {
      console.error('❌ Failed to clear persisted data:', error);
    }
  }, [storageKey, formType]);

  const hasPersistedData = useCallback(async (): Promise<boolean> => {
    if (!storageKey) return false;

    try {
      const savedData = await persistentStorageService.load(storageKey);
      if (!savedData) return false;
      
      return (
        persistentStorageService.validateMetadata(savedData, user?.store || 'unknown', user?.email || 'anonymous', formType) &&
        !persistentStorageService.isExpired(savedData, maxAge) &&
        hasMeaningfulData(savedData.data)
      );
    } catch {
      return false;
    }
  }, [storageKey, formType, maxAge, user]);

  const getPersistedDataInfo = useCallback(async () => {
    if (!storageKey) return null;

    try {
      const savedData = await persistentStorageService.load(storageKey);
      if (!savedData) return null;
      
      return {
        timestamp: new Date(savedData.meta.updatedAt),
        formType: savedData.meta.formType,
        hasData: hasMeaningfulData(savedData.data),
        version: savedData.meta.version,
        browser: savedData.meta.browser
      };
    } catch {
      return null;
    }
  }, [storageKey]);

  // Manual save function for critical moments
  const saveNow = useCallback(() => {
    saveFormData(formData, 'manual');
  }, [formData, saveFormData]);

  return {
    lastSaved,
    isRestoring,
    saveCount,
    clearPersistedData,
    hasPersistedData,
    getPersistedDataInfo,
    saveNow
  };
}