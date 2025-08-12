import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { persistentStorageService } from '@/services/persistentStorageService';
import { sanitizeFormData, hasMeaningfulData, getDefaultExcludeFields } from '@/utils/formSanitization';
import { useLocation } from 'react-router-dom';

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
  try { return (window as any).__AUTOSAVE_DEBUG === true; } catch { return false; }
};

export function useEnhancedFormPersistence<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: EnhancedPersistenceOptions
) {
  const { user, loading } = useAuth();
  const {
    formType,
    debounceMs = 1400, // Debounce typing to reduce save storms
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
  const lastSavedJsonRef = useRef<string | null>(null);
  const restoreFrozenRef = useRef(false);
  const userIsTypingRef = useRef(false);
  const formDataRef = useRef(formData);
  const allExcludeFieldsRef = useRef<string[]>([]);
  const isRestoringRef = useRef(isRestoring);
  const readyRef = useRef(ready);
  const lastImmediateSaveRef = useRef(0);
  const saveFormDataRef = useRef<((data: any, source: 'debounce'|'interval'|'manual'|'visibility') => void) | null>(null);
  const enabledRef = useRef(enabled); // Ordering Platform — Autosave Patch B: track enabled via ref

  // Enhanced field exclusion list
  const allExcludeFields = [...getDefaultExcludeFields(), ...excludeFields];
  
  // Stable, versioned storage key (Ordering Platform v2)
  const storageKey = useMemo(() => {
    const userId = (user as any)?.id || 'anon';
    return `OP:draft:${formType}:v2:${userId}`;
  }, [user, formType]);
  
  // Debounce form values for reactive saving
  const debouncedValues = useDebounce(formData, debounceMs);

  // Mount/unmount debug logging
  useEffect(() => {
    if (__autosaveShouldLog()) console.log('[AutoSave] MOUNT', { storageKey, enabled });
    return () => {
      if (__autosaveShouldLog()) console.log('[AutoSave] UNMOUNT', { storageKey });
      // Allow re-restore on next mount
      lastRestoredKeyRef.current = null;
      restoreFrozenRef.current = false;
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

  // Track user typing to avoid mid-typing restores
  useEffect(() => {
    const markTyping = () => { userIsTypingRef.current = true; };
    window.addEventListener('input', markTyping, { capture: true } as any);
    return () => window.removeEventListener('input', markTyping, { capture: true } as any);
  }, []);

  // Keep refs in sync with latest values for single-registered listeners
  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { allExcludeFieldsRef.current = allExcludeFields; }, [allExcludeFields]);
  useEffect(() => { isRestoringRef.current = isRestoring; }, [isRestoring]);
  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]); // Ordering Platform — Autosave Patch B: sync enabled ref

  // Save function with enhanced security and error handling
  const saveFormData = useCallback(async (data: any, source: 'debounce' | 'interval' | 'manual' | 'visibility' = 'debounce') => {
    if (!enabled || !storageKey) return;
    
    if (__autosaveShouldLog()) console.log(`[AutoSave] Attempting save from ${source}:`, {
      storageKey,
      hasUser: !!user,
      isRestoring,
      hasRestored: hasRestoredRef.current,
      dataSize: Object.keys(data || {}).length
    });

    // Sanitize and validate data
    const sanitizedData = sanitizeFormData(data, allExcludeFields);
    if (!hasMeaningfulData(sanitizedData)) return;

    // De-duplicate identical saves
    try {
      const json = JSON.stringify(sanitizedData);
      if (lastSavedJsonRef.current === json) {
        if (__autosaveShouldLog()) console.log('[AutoSave] Skipping save — no changes', { source });
        return;
      }
      lastSavedJsonRef.current = json;
    } catch (e) {
      // If stringify fails, proceed without dedupe
    }

    try {
      const meta = {
        store: user?.store || 'unknown',
        user: user?.email || 'anonymous',
        formType,
        version: '2.0'
      } as const;

      await persistentStorageService.save(storageKey, sanitizedData, meta);

      setLastSaved(new Date());
      setSaveCount(prev => prev + 1);
      
      if (__autosaveShouldLog()) console.log(`[AutoSave] ✅ Save completed from ${source}:`, {
        formType,
        storageKey,
        saveCount: saveCount + 1,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      // Handle QuotaExceededError with minimal oldest-first eviction and single retry
      const isQuotaError = () => {
        try {
          return (
            error?.name === 'QuotaExceededError' ||
            error?.code === 22 ||
            /quota|exceed/i.test(String(error?.message || ''))
          );
        } catch { return false; }
      };

      const tryEvictAndRetry = async () => {
        let evicted = 0;
        try {
          if (typeof localStorage === 'undefined') return 0;
          // Gather OP drafts with their updatedAt
          const drafts: { key: string; updatedAt: number }[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('OP:draft:')) continue;
            try {
              const raw = localStorage.getItem(key);
              if (!raw) continue;
              const parsed = JSON.parse(raw);
              const ts = new Date(parsed?.meta?.updatedAt || 0).getTime() || 0;
              drafts.push({ key, updatedAt: ts });
            } catch {
              // Corrupt entry — evict
              localStorage.removeItem(key);
              evicted++;
            }
          }
          drafts.sort((a, b) => a.updatedAt - b.updatedAt);
          if (drafts.length > 0) {
            localStorage.removeItem(drafts[0].key);
            evicted++;
          }
        } catch {}
        return evicted;
      };

      if (isQuotaError()) {
        if (__autosaveShouldLog()) console.warn('[AutoSave] Quota exceeded — attempting eviction');
        const evicted = await tryEvictAndRetry();
        if (evicted > 0) {
          try {
            const meta = {
              store: user?.store || 'unknown',
              user: user?.email || 'anonymous',
              formType,
              version: '2.0'
            } as const;
            await persistentStorageService.save(storageKey, sanitizedData, meta);
            setLastSaved(new Date());
            setSaveCount(prev => prev + 1);
            if (__autosaveShouldLog()) console.log('[AutoSave] ✅ Save succeeded after eviction');
            return;
          } catch (e2) {
            console.warn('[AutoSave] Save failed after eviction retry');
          }
        } else {
          console.warn('[AutoSave] Quota exceeded and no drafts evicted');
        }
      }

      console.error(`[AutoSave] ❌ Save failed from ${source}:`, error);
    }
  }, [enabled, storageKey, user, formType, allExcludeFields, saveCount]);

  useEffect(() => {
    saveFormDataRef.current = saveFormData as any;
  }, [saveFormData]);

  // Track tab visibility and save immediately when tab becomes hidden (single registration)
  useEffect(() => {
    const handleImmediateSave = (reason: string) => {
      try {
        if (!enabledRef.current) return;
        if (!readyRef.current || isRestoringRef.current) return;
        const now = Date.now();
        if (now - lastImmediateSaveRef.current < 1000) {
          return; // 1s rate limit to prevent storms
        }
        const data = formDataRef.current;
        const exclude = allExcludeFieldsRef.current;
        if (hasMeaningfulData(sanitizeFormData(data, exclude))) {
          if (__autosaveShouldLog()) console.log(`[AutoSave] ${reason} - saving immediately`);
          saveFormDataRef.current?.(data, 'visibility');
          lastImmediateSaveRef.current = now;
        }
      } catch {}
    };

    const handleVisibilityChange = () => {
      if (__autosaveShouldLog()) console.log('[AutoSave] VISIBILITY CHANGE', document.visibilityState);
      const wasActive = isTabActiveRef.current;
      isTabActiveRef.current = !document.hidden;
      
      // Save immediately when tab becomes hidden (user switching tabs)
      if (wasActive && document.hidden) {
        handleImmediateSave('Tab hidden');
      }
    };

    const handlePageHide = () => {
      handleImmediateSave('Page hide');
    };

    const handleBlur = () => {
      handleImmediateSave('Window blur');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide, { capture: true } as any);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide, { capture: true } as any);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Load saved data when auth is ready and per storage key
  useEffect(() => {
    if (!enabled) return;
    if (loading) {
      if (__autosaveShouldLog()) console.log('[AutoSave] Auth loading - deferring restore');
      return;
    }
    if (!storageKey) return;

    // Prevent multiple restore attempts per mount
    if (restoreFrozenRef.current) {
      if (__autosaveShouldLog()) console.log('[AutoSave] Skipping restore — already attempted this mount');
      setReady(true);
      return;
    }

    // Skip restore if the user has started typing
    if (userIsTypingRef.current) {
      if (__autosaveShouldLog()) console.log('[AutoSave] Skipping restore — user is typing');
      setReady(true);
      setDidRestore(false);
      restoreFrozenRef.current = true;
      return;
    }

    // Ordering Platform — Autosave Patch A: storage-first restore; do not pre-skip due to defaults

    const loadSavedData = async () => {
      try {
        if (__autosaveShouldLog()) console.log('[AutoSave] Loading saved data:', { storageKey, hasUser: !!user });
        
        let savedData = await persistentStorageService.load(storageKey);
        
        // If load failed due to corrupt JSON in localStorage, remove the bad entry to avoid crashes
        if (!savedData) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              try { JSON.parse(raw); } catch {
                localStorage.removeItem(storageKey);
                if (__autosaveShouldLog()) console.warn('[AutoSave] Removed corrupt draft entry', storageKey);
              }
            }
          } catch {}
        }
        
        // If no data found and we have user info, check for anonymous data to migrate (legacy)
        if (!savedData && user?.email && user?.store) {
          const anonymousKey = `autosave-anonymous-${formType}`;
          if (__autosaveShouldLog()) console.log('[AutoSave] Checking for anonymous data to migrate:', anonymousKey);
          
          const anonymousData = await persistentStorageService.load(anonymousKey);
          if (anonymousData) {
            if (__autosaveShouldLog()) console.log('[AutoSave] Migrating anonymous data to user-specific key');
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
            if (__autosaveShouldLog()) console.log('[AutoSave] ⏰ Saved data expired, removing');
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
        // Do not clear drafts on restore error
      } finally {
        hasRestoredRef.current = true;
        lastRestoredKeyRef.current = storageKey;
        setReady(true);
        restoreFrozenRef.current = true;
        if (__autosaveShouldLog()) console.log('[AutoSave] Restore attempt finished', { storageKey, didRestore });
      }
    };

    loadSavedData();
  }, [enabled, storageKey, formType, setFormData, onRestore, maxAge, user, loading]);

  // Debounced auto-save (allow saves during restoration but prevent overwrites)
  useEffect(() => {
    if (!enabled || !ready) return;
    
    if (isRestoring) {
      if (__autosaveShouldLog()) console.log('[AutoSave] Skipping save during restoration');
      return;
    }
    
    saveFormData(debouncedValues, 'debounce');
  }, [debouncedValues, enabled, isRestoring, saveFormData]);

  // Interval-based auto-save (only when tab is active)
  useEffect(() => {
    if (!enabled || !autoSaveInterval) return;

    intervalRef.current = setInterval(() => {
      if (isTabActiveRef.current && readyRef.current && !isRestoringRef.current) {
        const data = formDataRef.current;
        const exclude = allExcludeFieldsRef.current;
        if (hasMeaningfulData(sanitizeFormData(data, exclude))) {
          saveFormDataRef.current?.(data, 'interval');
        }
      }
    }, autoSaveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, autoSaveInterval]);

  // Save on page unload (single registration, gated)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (!enabledRef.current) return;
        if (!readyRef.current || isRestoringRef.current) return;
        const data = formDataRef.current;
        const exclude = allExcludeFieldsRef.current;
        if (hasMeaningfulData(sanitizeFormData(data, exclude))) {
          if (navigator.sendBeacon) {
            saveFormDataRef.current?.(data, 'manual');
          }
        }
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  // Save on component unmount (e.g., SPA route changes) using refs
  useEffect(() => {
    return () => {
      try {
        if (enabled && readyRef.current && !isRestoringRef.current) {
          const data = formDataRef.current;
          const exclude = allExcludeFieldsRef.current;
          if (hasMeaningfulData(sanitizeFormData(data, exclude))) {
            if (__autosaveShouldLog()) console.log('[AutoSave] Component unmount - saving immediately');
            saveFormDataRef.current?.(data, 'manual');
          }
        }
      } catch (e) {
        // no-op
      }
    };
  }, [enabled]);

  // Flush on React Router location change (cleanup runs before route leaves)
  const location = useLocation();
  useEffect(() => {
    return () => {
      try {
        if (enabledRef.current && readyRef.current && !isRestoringRef.current) {
          const data = formDataRef.current;
          const exclude = allExcludeFieldsRef.current;
          if (hasMeaningfulData(sanitizeFormData(data, exclude))) {
            if (__autosaveShouldLog()) console.log('[AutoSave] Route change - saving immediately');
            saveFormDataRef.current?.(data, 'manual');
          }
        }
      } catch {}
    };
  }, [location.key]);

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
      
      if (__autosaveShouldLog()) console.log(`[AutoSave] 🗑️ Cleared persisted data for ${formType}`);
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