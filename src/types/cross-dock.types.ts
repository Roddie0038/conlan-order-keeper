
/**
 * Shared Cross Dock field definitions
 * Used to ensure consistent field naming across the application
 */

export interface CrossDockFields {
  crossDock: string; // Required field
  crossDockDestination?: string;
  receiverNo?: string; // Added for cross dock validation
  etaDate?: string; // Added for cross dock validation
  crossDockConfirmation?: boolean; // Added for confirmation checkbox
}
