import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { makeDraftKey, FormType, SubType } from '@/utils/draftKeys';
import { migrateDraftKey, makeTempDraftKey, isPlaceholder } from '@/utils/draftKeyMigration';
import { debounce } from 'lodash';

// Enhanced types for telemetry
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type SaveSource = 'button' | 'autosave' | 'route_flush' | 'manual';

interface TelemetryEvent {
  event: string;
  userId?: string;
  draftKey?: string;
  store?: string;
  plant?: string;
  formType?: string;
  subtype?: string;
  source?: SaveSource;
  timestamp: string;
  durationMs?: number;
  error?: string;
}

interface ServerDraftOptions {
  formType: FormType;
  subType: SubType;
  store: string;
  plant: string;
  initialData: any;
  debounceMs?: number;
  excludeFields?: string[];
  onRestore?: (data: any) => void;
  enabled?: boolean;
  useTempKey?: boolean; // Enable temp->final key migration
}

interface LocalDraftData {
  data: any;
  updatedAt: string;
}

interface ServerDraftData {
  id: string;
  draft_key: string;
  form_type: string;
  subtype: string;
  store: string;
  plant: string;
  author_user_id: string;
  data: any;
  submitted: boolean;
  created_at: string;
  updated_at: string;
}

// Telemetry logging function
const logTelemetry = (event: TelemetryEvent) => {
  console.log(`📊 DRAFT_TELEMETRY - ${event.event}:`, event);
  // In production, this could send to analytics service
};

export function useServerOrderDraft({
  formType,
  subType,
  store,
  plant,
  initialData,
  debounceMs = 1000,
  excludeFields = [],
  onRestore,
  enabled = true,
  useTempKey = false
}: ServerDraftOptions) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasRestored, setHasRestored] = useState(false);
  const pendingRef = useRef<any>(null);
  const isRestoringRef = useRef(false);
  const savingNowRef = useRef(false); // Re-entry lock for saveNow()

  // Generate draft key with enhanced temp key logic (Deliverable 1)
  const draftKey = useMemo(() => {
    if (!user?.id || !enabled) return null;
    
    // Broaden temp-key gating for all placeholder values
    if (useTempKey && (isPlaceholder(store) || isPlaceholder(plant))) {
      return makeTempDraftKey(formType, subType, user.id);
    }
    
    return makeDraftKey(formType, subType, store, plant, user.id);
  }, [formType, subType, store, plant, user?.id, enabled, useTempKey]);

  // Track previous draft key for migration
  const prevDraftKeyRef = useRef<string | null>(null);

  // Handle draft key migration when store/plant resolve (Deliverable 2)
  useEffect(() => {
    if (!user?.id || !enabled || !useTempKey) return;
    
    const currentKey = draftKey;
    const previousKey = prevDraftKeyRef.current;
    
    if (previousKey && currentKey && previousKey !== currentKey) {
      // Check if we're migrating from temp key to final key
      if (previousKey.includes('__temp__') && !currentKey.includes('__temp__')) {
        console.log(`🔄 Migrating from temp key to final key: ${previousKey} → ${currentKey}`);
        
        const migrationStart = Date.now();
        migrateDraftKey(previousKey, currentKey)
          .then(() => {
            logTelemetry({
              event: 'draft_migrated',
              userId: user.id,
              draftKey: currentKey,
              store,
              plant,
              formType,
              subtype: subType,
              timestamp: new Date().toISOString(),
              durationMs: Date.now() - migrationStart
            });
          })
          .catch(error => {
            console.error('Migration failed:', error);
            logTelemetry({
              event: 'draft_migration_failed',
              userId: user.id,
              draftKey: currentKey,
              store,
              plant,
              formType,
              subtype: subType,
              timestamp: new Date().toISOString(),
              error: error.message
            });
          });
      }
    }
    
    prevDraftKeyRef.current = currentKey;
  }, [draftKey, user?.id, enabled, useTempKey, store, plant, formType, subType]);

  const localStorageKey = draftKey ? `draft:${draftKey}` : null;

  // Filter out excluded fields
  const filterData = useCallback((rawData: any) => {
    if (!excludeFields.length) return rawData;
    
    const filtered = { ...rawData };
    excludeFields.forEach(field => {
      delete filtered[field];
    });
    return filtered;
  }, [excludeFields]);

  // Check if data has meaningful content
  const hasMeaningfulData = useCallback((formData: any): boolean => {
    const filtered = filterData(formData);
    return Object.entries(filtered).some(([key, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'boolean' && value === false) return false;
      if (typeof value === 'number' && value === 0) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    });
  }, [filterData]);

  // Save to server with telemetry
  const saveToServer = useCallback(async (formData: any, source: SaveSource = 'autosave') => {
    if (!draftKey || !user?.id || !enabled || isRestoringRef.current) return;
    
    const saveStart = Date.now();
    try {
      const filteredData = filterData(formData);
      
      if (!hasMeaningfulData(filteredData)) {
        // Clear draft if no meaningful data
        await supabase
          .from('order_drafts')
          .update({ submitted: true })
          .eq('draft_key', draftKey);
        
        logTelemetry({
          event: 'draft_cleared',
          userId: user.id,
          draftKey,
          store,
          plant,
          formType,
          subtype: subType,
          source,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - saveStart
        });
        return;
      }

      const { error } = await supabase
        .from('order_drafts')
        .upsert({
          draft_key: draftKey,
          form_type: formType,
          subtype: subType,
          store,
          plant,
          author_user_id: user.id,
          data: filteredData,
          submitted: false
        }, {
          onConflict: 'draft_key'
        });

      if (error) {
        console.error('Error saving draft to server:', error);
        setSaveStatus('error');
        
        logTelemetry({
          event: 'draft_save_failed',
          userId: user.id,
          draftKey,
          store,
          plant,
          formType,
          subtype: subType,
          source,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        return;
      }

      setLastSaved(new Date());
      setSaveStatus('saved');
      
      logTelemetry({
        event: 'draft_saved',
        userId: user.id,
        draftKey,
        store,
        plant,
        formType,
        subtype: subType,
        source,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - saveStart
      });
      
      console.log(`✅ Server draft saved: ${draftKey}`);
    } catch (error) {
      console.error('Error in saveToServer:', error);
      setSaveStatus('error');
      
      logTelemetry({
        event: 'draft_save_error',
        userId: user.id,
        draftKey,
        store,
        plant,
        formType,
        subtype: subType,
        source,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, [draftKey, user?.id, enabled, filterData, hasMeaningfulData, formType, subType, store, plant]);

  // Save to local storage
  const saveToLocal = useCallback((formData: any) => {
    if (!draftKey || !enabled || !localStorageKey) return;
    
    try {
      const filteredData = filterData(formData);
      const localData: LocalDraftData = {
        data: filteredData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(localStorageKey, JSON.stringify(localData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [draftKey, enabled, filterData, localStorageKey]);

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (formData: any) => {
      if (!enabled || isRestoringRef.current) return;
      
      setSaveStatus('saving');
      
      // Save locally immediately
      saveToLocal(formData);
      
      // Then save to server
      await saveToServer(formData, 'autosave');
    }, debounceMs),
    [debounceMs, enabled, saveToLocal, saveToServer]
  );

  // Immediate save function with re-entry lock (Deliverable 5)
  const saveNow = useCallback(async (source: SaveSource = 'button') => {
    // Re-entry lock to prevent concurrent saves
    if (savingNowRef.current) {
      console.log('🔒 saveNow() already in progress, skipping...');
      return;
    }
    
    savingNowRef.current = true;
    
    try {
      const dataToSave = pendingRef.current ?? data;
      if (!dataToSave) return;

      setSaveStatus('saving');
      
      // Save locally immediately (optimistic)
      saveToLocal(dataToSave);
      
      // Log telemetry for save now action
      logTelemetry({
        event: 'draft_save_now',
        userId: user?.id,
        draftKey,
        store,
        plant,
        formType,
        subtype: subType,
        source,
        timestamp: new Date().toISOString()
      });
      
      // Then save to server
      await saveToServer(dataToSave, source);
      
      // Show success toast
      toast({
        title: "Draft saved",
        description: `Saved at ${new Date().toLocaleTimeString()}`,
        className: "bg-green-50 border-green-200"
      });
      
    } finally {
      savingNowRef.current = false;
    }
  }, [data, saveToLocal, saveToServer, draftKey, store, plant, formType, subType, user?.id]);

  // Update function for external data changes
  const update = useCallback((newData: any) => {
    if (isRestoringRef.current) return;
    
    setData(newData);
    pendingRef.current = newData;
    
    // Trigger debounced save
    debouncedSave(newData);
  }, [debouncedSave]);

  // Restore from local storage
  const restoreFromLocal = useCallback((): any => {
    if (!localStorageKey) return null;
    
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (!stored) return null;
      
      const parsed: LocalDraftData = JSON.parse(stored);
      return parsed.data;
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
      return null;
    }
  }, [localStorageKey]);

  // Restore from server
  const restoreFromServer = useCallback(async (): Promise<any> => {
    if (!draftKey || !user?.id) return null;
    
    try {
      const { data: draft, error } = await supabase
        .from('order_drafts')
        .select('*')
        .eq('draft_key', draftKey)
        .eq('submitted', false)
        .maybeSingle();
      
      if (error) {
        console.error('Error restoring from server:', error);
        return null;
      }
      
      return draft?.data || null;
    } catch (error) {
      console.error('Error in restoreFromServer:', error);
      return null;
    }
  }, [draftKey, user?.id]);

  // Fallback restore - find newest unsubmitted draft for user (Deliverable 3)
  const fallbackRestore = useCallback(async (): Promise<any> => {
    if (!user?.id || !enabled) return null;
    
    try {
      const { data: newest, error } = await supabase
        .from('order_drafts')
        .select('*')
        .eq('author_user_id', user.id)
        .eq('form_type', formType)
        .eq('submitted', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error || !newest || newest.draft_key === draftKey) {
        return null;
      }
      
      console.log(`🔍 Found fallback draft from ${newest.updated_at}: ${newest.draft_key}`);
      
      // Offer to restore with a toast
      const shouldRestore = true; // Auto-restore for now - could show UI prompt
      
      if (shouldRestore) {
        console.log(`🔄 Auto-restoring fallback draft: ${newest.draft_key} → ${draftKey}`);
        
        // Migrate to current key
        if (draftKey) {
          await migrateDraftKey(newest.draft_key, draftKey);
        }
        
        logTelemetry({
          event: 'draft_fallback_restored',
          userId: user.id,
          draftKey,
          store,
          plant,
          formType,
          subtype: subType,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Draft restored",
          description: `Restored recent draft from ${new Date(newest.updated_at).toLocaleString()}`,
          className: "bg-blue-50 border-blue-200"
        });
        
        return newest.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fallbackRestore:', error);
      return null;
    }
  }, [user?.id, enabled, formType, draftKey, store, plant, subType]);

  // Main restore function with enhanced UX truth (Deliverable 6)
  const restoreData = useCallback(async () => {
    if (!enabled || hasRestored || isRestoringRef.current) return;
    
    isRestoringRef.current = true;
    
    try {
      // Try local first, then server, then fallback
      let restoredData = restoreFromLocal();
      let source = 'local';
      
      if (!restoredData) {
        restoredData = await restoreFromServer();
        source = 'server';
      }
      
      if (!restoredData) {
        restoredData = await fallbackRestore();
        source = 'fallback';
      }
      
      if (restoredData) {
        setData(restoredData);
        pendingRef.current = restoredData;
        
        // Set restore flags and UI truth (Deliverable 6)
        setHasRestored(true);
        setLastSaved(new Date());
        setSaveStatus('saved');
        
        onRestore?.(restoredData);
        
        logTelemetry({
          event: 'draft_restored',
          userId: user?.id,
          draftKey,
          store,
          plant,
          formType,
          subtype: subType,
          source: source as SaveSource,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Draft restored from ${source}:`, draftKey);
      } else {
        // No data to restore, but still mark as restored to prevent further attempts
        setHasRestored(true);
        setSaveStatus('idle');
      }
    } finally {
      isRestoringRef.current = false;
    }
  }, [enabled, hasRestored, restoreFromLocal, restoreFromServer, fallbackRestore, onRestore, draftKey, store, plant, formType, subType, user?.id]);

  // Discard draft (soft-close)
  const discardDraft = useCallback(async () => {
    if (!draftKey || !user?.id) return;
    
    try {
      // Clear local storage
      if (localStorageKey) {
        localStorage.removeItem(localStorageKey);
      }
      
      // Soft-close server draft
      await supabase
        .from('order_drafts')
        .update({ submitted: true })
        .eq('draft_key', draftKey)
        .eq('submitted', false);
      
      // Reset state
      setData(initialData);
      setLastSaved(null);
      setSaveStatus('idle');
      pendingRef.current = null;
      
      logTelemetry({
        event: 'draft_discarded',
        userId: user.id,
        draftKey,
        store,
        plant,
        formType,
        subtype: subType,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Draft discarded",
        description: "Your draft has been discarded",
        variant: "destructive"
      });
      
      console.log(`🗑️ Draft discarded: ${draftKey}`);
    } catch (error) {
      console.error('Error discarding draft:', error);
    }
  }, [draftKey, user?.id, localStorageKey, initialData, store, plant, formType, subType]);

  // Initialize restoration on mount
  useEffect(() => {
    if (enabled && draftKey && !hasRestored) {
      restoreData();
    }
  }, [enabled, draftKey, hasRestored, restoreData]);

  return {
    data,
    saveStatus,
    lastSaved,
    hasRestored,
    draftKey,
    update,
    saveNow,
    discardDraft,
    // Legacy compatibility
    ready: hasRestored,
    didRestore: hasRestored
  };
}