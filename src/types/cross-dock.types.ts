
/**
 * Shared Cross Dock field definitions
 * Used to ensure consistent field naming across the application
 */

export interface CrossDockFields {
  crossDock: string; // Changed from optional to required
  crossDockDestination?: string;
}
