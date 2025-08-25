import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { makeDraftKey, FormType, SubType } from '@/utils/draftKeys';

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
  data: any;
  updated_at: string;
  submitted: boolean;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function useServerOrderDraft({
  formType,
  subType,
  store,
  plant,
  initialData,
  debounceMs = 1000,
  excludeFields = [],
  onRestore,
  enabled = true
}: ServerDraftOptions) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasRestored, setHasRestored] = useState(false);
  const pendingRef = useRef<any>(null);
  const isRestoringRef = useRef(false);

  // Generate draft key
  const draftKey = useMemo(() => {
    if (!user?.id || !enabled) return null;
    return makeDraftKey(formType, subType, store, plant, user.id);
  }, [formType, subType, store, plant, user?.id, enabled]);

  const localStorageKey = `draft:${draftKey}`;

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

  // Save to server
  const saveToServer = useCallback(async (formData: any) => {
    if (!draftKey || !user?.id || !enabled || isRestoringRef.current) return;
    
    try {
      const filteredData = filterData(formData);
      
      if (!hasMeaningfulData(filteredData)) {
        // Clear draft if no meaningful data
        await supabase
          .from('order_drafts')
          .update({ submitted: true })
          .eq('draft_key', draftKey);
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
        return;
      }

      setLastSaved(new Date());
      setSaveStatus('saved');
      
      console.log(`✅ Server draft saved: ${draftKey}`);
    } catch (error) {
      console.error('Error in saveToServer:', error);
      setSaveStatus('error');
    }
  }, [draftKey, user?.id, enabled, filterData, hasMeaningfulData, formType, subType, store, plant]);

  // Save to local storage
  const saveToLocal = useCallback((formData: any) => {
    if (!draftKey || !enabled) return;
    
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
      
      // Save to server with debounce
      await saveToServer(formData);
    }, debounceMs),
    [enabled, saveToLocal, saveToServer, debounceMs]
  );

  // Restore from storage on mount
  useEffect(() => {
    if (!draftKey || !enabled || hasRestored) return;

    (async () => {
      isRestoringRef.current = true;
      
      try {
        // Get local draft
        let localDraft: LocalDraftData | null = null;
        try {
          const localRaw = localStorage.getItem(localStorageKey);
          if (localRaw) {
            localDraft = JSON.parse(localRaw);
          }
        } catch (error) {
          console.warn('Error parsing local draft:', error);
        }

        // Get server draft
        const { data: serverDraft, error } = await supabase
          .from('order_drafts')
          .select('*')
          .eq('draft_key', draftKey)
          .eq('submitted', false)
          .maybeSingle();

        if (error) {
          console.error('Error fetching server draft:', error);
        }

        // Determine which draft to use (newest wins)
        let restoredData = initialData;
        let restoredFrom: 'none' | 'local' | 'server' = 'none';

        if (serverDraft && localDraft) {
          const serverTime = new Date(serverDraft.updated_at).getTime();
          const localTime = new Date(localDraft.updatedAt).getTime();
          
          if (serverTime >= localTime) {
            restoredData = serverDraft.data;
            restoredFrom = 'server';
          } else {
            restoredData = localDraft.data;
            restoredFrom = 'local';
          }
        } else if (serverDraft) {
          restoredData = serverDraft.data;
          restoredFrom = 'server';
        } else if (localDraft) {
          restoredData = localDraft.data;
          restoredFrom = 'local';
        }

        // Only restore if we have meaningful data
        if (restoredFrom !== 'none' && hasMeaningfulData(restoredData)) {
          setData(restoredData);
          
          const timestamp = restoredFrom === 'server' 
            ? new Date(serverDraft!.updated_at)
            : new Date(localDraft!.updatedAt);
          
          setLastSaved(timestamp);
          
          toast({
            title: "Draft Restored",
            description: `Your previous work from ${timestamp.toLocaleString()} has been restored.`,
          });

          onRestore?.(restoredData);
          
          console.log(`🔄 Draft restored from ${restoredFrom}: ${draftKey}`);
        }
      } catch (error) {
        console.error('Error during draft restoration:', error);
        toast({
          title: "Draft Restoration Failed",
          description: "Could not restore your previous work. Starting with a clean form.",
          variant: "destructive"
        });
      } finally {
        setHasRestored(true);
        isRestoringRef.current = false;
      }
    })();
  }, [draftKey, enabled, hasRestored, initialData, hasMeaningfulData, onRestore, localStorageKey]);

  // Update function
  const update = useCallback((nextData: any | ((prev: any) => any)) => {
    if (!enabled || isRestoringRef.current) return;
    
    const newData = typeof nextData === 'function' ? nextData(data) : nextData;
    setData(newData);
    pendingRef.current = newData;
    
    // Trigger debounced save
    debouncedSave(newData);
  }, [enabled, data, debouncedSave]);

  // Flush pending saves on visibility change/page unload
  useEffect(() => {
    if (!enabled) return;

    const flush = async () => {
      if (!pendingRef.current || !draftKey) return;
      
      try {
        // Force immediate save
        saveToLocal(pendingRef.current);
        await saveToServer(pendingRef.current);
      } catch (error) {
        console.error('Error flushing draft:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };

    const handlePageHide = () => {
      flush();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [enabled, draftKey, saveToLocal, saveToServer]);

  // Mark draft as submitted
  const markSubmitted = useCallback(async () => {
    if (!draftKey || !enabled) return;
    
    try {
      // Mark server draft as submitted
      await supabase
        .from('order_drafts')
        .update({ submitted: true })
        .eq('draft_key', draftKey);
      
      // Clear local draft
      localStorage.removeItem(localStorageKey);
      
      console.log(`✅ Draft marked as submitted: ${draftKey}`);
    } catch (error) {
      console.error('Error marking draft as submitted:', error);
    }
  }, [draftKey, enabled, localStorageKey]);

  // Discard draft
  const discardDraft = useCallback(async () => {
    if (!draftKey || !enabled) return;
    
    try {
      // Mark as submitted (soft delete)
      await markSubmitted();
      
      // Reset form data
      setData(initialData);
      setSaveStatus('idle');
      setLastSaved(null);
      
      toast({
        title: "Draft Discarded",
        description: "Your draft has been cleared and the form has been reset.",
      });
      
      console.log(`🗑️ Draft discarded: ${draftKey}`);
    } catch (error) {
      console.error('Error discarding draft:', error);
      toast({
        title: "Error",
        description: "Failed to discard draft. Please try again.",
        variant: "destructive"
      });
    }
  }, [draftKey, enabled, markSubmitted, initialData]);

  // Force save now
  const saveNow = useCallback(async () => {
    if (!enabled || !pendingRef.current) return;
    
    setSaveStatus('saving');
    saveToLocal(pendingRef.current);
    await saveToServer(pendingRef.current);
  }, [enabled, saveToLocal, saveToServer]);

  return {
    data,
    update,
    saveStatus,
    lastSaved,
    markSubmitted,
    discardDraft,
    saveNow,
    hasRestored,
    draftKey
  };
}