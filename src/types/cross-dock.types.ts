
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
  // Note: According to the schema, only cross_dock_type exists, not cross_dock
  cross_dock_type?: "Yes" | "No"; // Match the database column name
  cross_dock_destination?: string;
  cross_dock_receiver_number?: string;
  cross_dock_eta_date?: string;
}
