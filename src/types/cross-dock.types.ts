
/**
 * Shared Cross Dock field definitions
 * Used to ensure consistent field naming across the application
 */

export interface CrossDockFields {
  // Frontend naming convention
  crossDock: "Yes" | "No"; // Updated to be a string union type matching the Zod schema
  crossDockDestination?: string;
  receiverNo?: string; // Added for cross dock validation
  etaDate?: string; // Added for cross dock validation
  crossDockConfirmation?: boolean; // Added for confirmation checkbox
  
  // Database column naming convention
  cross_dock?: "Yes" | "No";
  cross_dock_destination?: string;
  cross_dock_receiver_number?: string;
  cross_dock_eta_date?: string;
}
