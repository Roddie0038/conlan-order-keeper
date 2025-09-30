// Feature flags for controlling app behavior
export const FEATURE_FLAGS = {
  // Google Sheets integration (disabled for MTO orders, they now go to Supabase Edge Function)
  USE_SHEETS: false,
  
  // MTO Edge Function integration (enabled by default)
  MTO_EDGE_ENABLED: true,
  
  // Debug logging for order submissions
  DEBUG_ORDER_SUBMISSION: true,
  
  // Telemetry and logging
  ENABLE_TELEMETRY: true,
} as const;

// Runtime feature flag checker
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

// Log feature flags on startup for debugging
console.log('🚩 FEATURE FLAGS - Current configuration:', FEATURE_FLAGS);