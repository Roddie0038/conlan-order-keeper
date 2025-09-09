/**
 * Diagnostics Agent Configuration
 * Feature-flagged logging system for investigating form state loss
 */

// Only enable in development when explicitly activated
export const DIAG_ENABLED = 
  typeof window !== 'undefined' && 
  process.env.NODE_ENV !== 'production' && 
  import.meta.env.VITE_DIAG_AGENT === 'true';

// SessionStorage key for diagnostic logs
export const DIAG_KEY = 'diag:new-order-form';

// Maximum number of log entries to prevent memory bloat
export const MAX_LOG_ENTRIES = 100;

// Log event types
export type NavEvent =
  | { kind: 'ROUTE_CHANGE'; from: string; to: string; ts: number }
  | { kind: 'PAGEHIDE'; persisted: boolean; ts: number }
  | { kind: 'BEFORE_UNLOAD'; ts: number }
  | { kind: 'NAVIGATION_TYPE'; navType: string; ts: number }
  | { kind: 'VISIBILITY_CHANGE'; hidden: boolean; ts: number }
  | { kind: 'POPSTATE'; state: any; ts: number };

export type FormEvent =
  | { kind: 'FORM_MOUNT'; formId: string; route: string; ts: number }
  | { kind: 'FORM_UNMOUNT'; formId: string; route: string; ts: number }
  | { kind: 'FORM_STATE'; formId: string; fieldCount: number; dirtyFieldsCount: number; touchedFieldsCount: number; ts: number };

export type DiagEvent = NavEvent | FormEvent;

// Utility to safely write to sessionStorage ring buffer
export function logEvent(event: DiagEvent): void {
  if (!DIAG_ENABLED) return;

  try {
    // Console logging with grouped format
    console.groupCollapsed(`[DIAG][NewOrder] ${event.kind}`);
    console.log(event);
    console.groupEnd();

    // SessionStorage ring buffer
    const existing = sessionStorage.getItem(DIAG_KEY);
    const logs: DiagEvent[] = existing ? JSON.parse(existing) : [];
    
    logs.push(event);
    
    // Maintain ring buffer size
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.splice(0, logs.length - MAX_LOG_ENTRIES);
    }
    
    sessionStorage.setItem(DIAG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('[DIAG] Failed to log event:', error);
  }
}