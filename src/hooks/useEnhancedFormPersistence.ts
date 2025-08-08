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

// Global debug flag to control autosave logging
const __autosaveShouldLog = () => {
  try { return (window as any).__AUTOSAVE_DEBUG !== false; } catch { return true; }
};

export function useEnhancedFormPersistence<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: EnhancedPersistenceOptions
) {
  const { user, loading } = useAuth();
  const {
    formType,
    debounceMs = 500, // Faster debounce for quicker first save
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
  const lastRestoredKeyRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [didRestore, setDidRestore] = useState(false);
  
  // Enhanced field exclusion list
  const allExcludeFields = [...getDefaultExcludeFields(), ...excludeFields];
  
  // Generate storage key with anonymous fallback
  const getStorageKey = useCallback(() => {
    if (user?.email && user?.store) {
      return persistentStorageService.generateKey(user.store, user.email, formType);
    }
    // Fallback to anonymous key when user isn't loaded yet
    return `autosave-anonymous-${formType}`;
  }, [user?.email, user?.store, formType]);
  
  const storageKey = getStorageKey();
  
  // Debounce form values for reactive saving
  const debouncedValues = useDebounce(formData, debounceMs);

  // Mount/unmount debug logging
  useEffect(() => {
    console.log('[AutoSave] MOUNT', { storageKey, enabled });
    return () => {
      console.log('[AutoSave] UNMOUNT', { storageKey });
      // Allow re-restore on next mount
      lastRestoredKeyRef.current = null;
    };
  }, [storageKey, enabled]);

  // Router-aware reset to ensure next mount restores
  useEffect(() => {
    const reset = () => {
      lastRestoredKeyRef.current = null;
      if (__autosaveShouldLog()) console.log('[AutoSave] Route change detected – reset restore guard');
    };

    // Fire a custom event on history changes
    const wrap = (type: 'pushState' | 'replaceState') => {
      const orig = (history as any)[type];
      return function(this: any, ...args: any[]) {
        const ret = orig.apply(this, args as any);
        window.dispatchEvent(new Event('locationchange'));
        return ret;
      };
    };

    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    (history as any).pushState = wrap('pushState');
    (history as any).replaceState = wrap('replaceState');

    window.addEventListener('popstate', reset);
    window.addEventListener('locationchange', reset);

    return () => {
      (history as any).pushState = originalPush;
      (history as any).replaceState = originalReplace;
      window.removeEventListener('popstate', reset);
      window.removeEventListener('locationchange', reset);
    };
  }, []);

  // Save function with enhanced security and error handling
  const saveFormData = useCallback(async (data: any, source: 'debounce' | 'interval' | 'manual' | 'visibility' = 'debounce') => {
    if (!enabled || !storageKey) return;
    
    console.log(`[AutoSave] Attempting save from ${source}:`, {
      storageKey,
      hasUser: !!user,
      isRestoring,
      hasRestored: hasRestoredRef.current,
      dataSize: Object.keys(data || {}).length
    });

    // Sanitize and validate data
    const sanitizedData = sanitizeFormData(data, allExcludeFields);
    if (!hasMeaningfulData(sanitizedData)) return;

    try {
      await persistentStorageService.save(storageKey, sanitizedData, {
        store: user?.store || 'unknown',
        user: user?.email || 'anonymous',
        formType,
        version: '2.0'
      });

      setLastSaved(new Date());
      setSaveCount(prev => prev + 1);
      
      console.log(`[AutoSave] ✅ Save completed from ${source}:`, {
        formType,
        storageKey,
        saveCount: saveCount + 1,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`[AutoSave] ❌ Save failed from ${source}:`, error);
    }
  }, [enabled, storageKey, user, formType, allExcludeFields, saveCount]);

  // Track tab visibility and save immediately when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (__autosaveShouldLog()) console.log('[AutoSave] VISIBILITY CHANGE', document.visibilityState);
      const wasActive = isTabActiveRef.current;
      isTabActiveRef.current = !document.hidden;
      
      // Save immediately when tab becomes hidden (user switching tabs)
      if (wasActive && document.hidden && hasMeaningfulData(sanitizeFormData(formData, allExcludeFields))) {
        console.log('[AutoSave] Tab hidden - saving immediately');
        saveFormData(formData, 'visibility');
      }
    };

    const handlePageHide = () => {
      // Mobile Safari compatibility
      if (hasMeaningfulData(sanitizeFormData(formData, allExcludeFields))) {
        console.log('[AutoSave] Page hide - saving immediately');
        saveFormData(formData, 'visibility');
      }
    };

    const handleBlur = () => {
      // Window loses focus
      if (hasMeaningfulData(sanitizeFormData(formData, allExcludeFields))) {
        console.log('[AutoSave] Window blur - saving immediately');
        saveFormData(formData, 'visibility');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleBlur);
    };
  }, [formData, saveFormData, allExcludeFields]);

  // Load saved data when auth is ready and per storage key
  useEffect(() => {
    if (!enabled) return;
    if (loading) {
      console.log('[AutoSave] Auth loading - deferring restore');
      return;
    }
    if (!storageKey) return;

    // Skip restore if the current form already has meaningful data
    try {
      const alreadyHasData = hasMeaningfulData(sanitizeFormData(formData, allExcludeFields));
      if (alreadyHasData) {
        console.log('[AutoSave] Skipping restore — reason: already has data');
        setReady(true);
        return;
      }
    } catch (e) {
      // no-op
    }

    const loadSavedData = async () => {
      try {
        console.log('[AutoSave] Loading saved data:', { storageKey, hasUser: !!user });
        
        let savedData = await persistentStorageService.load(storageKey);
        
        // If no data found and we have user info, check for anonymous data to migrate
        if (!savedData && user?.email && user?.store) {
          const anonymousKey = `autosave-anonymous-${formType}`;
          console.log('[AutoSave] Checking for anonymous data to migrate:', anonymousKey);
          
          const anonymousData = await persistentStorageService.load(anonymousKey);
          if (anonymousData) {
            console.log('[AutoSave] Migrating anonymous data to user-specific key');
            // Save to authenticated key
            await persistentStorageService.save(storageKey, anonymousData.data, {
              store: user.store,
              user: user.email,
              formType,
              version: '2.0'
            });
            // Remove anonymous data
            await persistentStorageService.remove(anonymousKey);
            savedData = await persistentStorageService.load(storageKey);
          }
        }
        
        if (__autosaveShouldLog()) console.log('[AutoSave] LOAD RESULT', { storageKey, found: !!savedData, keys: savedData ? Object.keys(savedData.data || {}) : [], meta: savedData?.meta });
        
        if (savedData) {
          // For anonymous keys, skip metadata validation
          const isAnonymousKey = storageKey.includes('anonymous');
          if (!isAnonymousKey && user) {
            // Validate metadata for authenticated keys
            if (!persistentStorageService.validateMetadata(savedData, user.store || 'unknown', user.email || 'anonymous', formType)) {
              if (__autosaveShouldLog()) console.warn('[AutoSave] Metadata mismatch', { stored: savedData.meta, expected: { store: user.store, user: user.email, formType } });
              return;
            }
          }

          // Check expiration
          if (persistentStorageService.isExpired(savedData, maxAge)) {
            console.log('[AutoSave] ⏰ Saved data expired, removing');
            await persistentStorageService.remove(storageKey);
            return;
          }

          // Validate and restore data
          if (__autosaveShouldLog()) console.log('[AutoSave] MEANINGFUL?', { result: hasMeaningfulData(savedData.data), sample: savedData.data });
          if (hasMeaningfulData(savedData.data)) {
            setIsRestoring(true);
            
            // Restore form data
            setFormData(savedData.data);
            setLastSaved(new Date(savedData.meta.updatedAt));
            setDidRestore(true);
            
            // Show restoration feedback
            const savedTime = new Date(savedData.meta.updatedAt).toLocaleString();
            const isAnonymous = storageKey.includes('anonymous');
            toast({
              title: "Form Data Restored",
              description: `Your previous work from ${savedTime} has been restored.${isAnonymous ? ' (from before login)' : ''}`,
            });

            onRestore?.(savedData.data);
            
            console.log(`[AutoSave] 🔄 Form data restored for ${formType}:`, {
              timestamp: savedData.meta.updatedAt,
              version: savedData.meta.version,
              wasAnonymous: isAnonymous
            });
            
            setTimeout(() => setIsRestoring(false), 100); // Shorter restore window
          }
        }
      } catch (error) {
        console.error('[AutoSave] ❌ Failed to restore form data:', error);
        if (storageKey) {
          await persistentStorageService.remove(storageKey);
        }
      } finally {
        hasRestoredRef.current = true;
        lastRestoredKeyRef.current = storageKey;
        setReady(true);
        console.log('[AutoSave] Restore attempt finished', { storageKey, didRestore });
      }
    };

    loadSavedData();
  }, [enabled, storageKey, formType, setFormData, onRestore, maxAge, user, loading]);

  // Debounced auto-save (allow saves during restoration but prevent overwrites)
  useEffect(() => {
    if (!enabled) return;
    
    // Only block saves for first 500ms after restoration starts
    if (isRestoring && !hasRestoredRef.current) {
      console.log('[AutoSave] Skipping save during restoration');
      return;
    }
    
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

  // Save on component unmount (e.g., SPA route changes)
  useEffect(() => {
    return () => {
      try {
        if (enabled && hasMeaningfulData(sanitizeFormData(formData, allExcludeFields))) {
          console.log('[AutoSave] Component unmount - saving immediately');
          saveFormData(formData, 'manual');
        }
      } catch (e) {
        // no-op
      }
    };
  }, [enabled, formData, saveFormData, allExcludeFields]);

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
      
      // Also clear anonymous version if it exists
      const anonymousKey = `autosave-anonymous-${formType}`;
      await persistentStorageService.remove(anonymousKey);
      
      setLastSaved(null);
      setSaveCount(0);
      
      toast({
        title: "Form Cleared",
        description: "All form data has been cleared and removed from storage.",
      });
      
      console.log(`[AutoSave] 🗑️ Cleared persisted data for ${formType}`);
    } catch (error) {
      console.error('[AutoSave] ❌ Failed to clear persisted data:', error);
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

  // Reset readiness when key changes or auth loading
  useEffect(() => {
    setReady(false);
    setDidRestore(false);
  }, [storageKey]);

  useEffect(() => {
    if (loading) setReady(false);
  }, [loading]);

  return {
    lastSaved,
    isRestoring,
    saveCount,
    clearPersistedData,
    hasPersistedData,
    getPersistedDataInfo,
    saveNow,
    ready,
    didRestore
  };
}