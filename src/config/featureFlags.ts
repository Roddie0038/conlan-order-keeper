
import { isStaging, isProduction } from './environment';

/**
 * Feature flags configuration
 * This allows us to enable/disable features based on environment
 */
export interface FeatureFlags {
  // Authentication features
  enableNewAuthFlow: boolean;
  
  // Order management features
  enableBulkOrderProcessing: boolean;
  enableOrderScheduling: boolean;
  
  // Inventory features
  enableRealTimeInventory: boolean;
  enableInventoryAlerts: boolean;
  
  // Cross-dock features
  enableAdvancedCrossDock: boolean;
  
  // Testing features
  enableTestingMode: boolean;
}

// Default feature flags (used in production)
const defaultFeatureFlags: FeatureFlags = {
  enableNewAuthFlow: false,
  enableBulkOrderProcessing: false,
  enableOrderScheduling: false,
  enableRealTimeInventory: true,
  enableInventoryAlerts: true,
  enableAdvancedCrossDock: false,
  enableTestingMode: false,
};

// Staging-specific feature flags
const stagingFeatureFlags: Partial<FeatureFlags> = {
  enableTestingMode: true,
  // Add any experimental features you want to test in staging
  enableNewAuthFlow: true,
  enableBulkOrderProcessing: true,
  enableAdvancedCrossDock: true,
};

// Override flags based on specific conditions (useful for testing in production)
const overrideFlags: Partial<FeatureFlags> = {};

// URL parameter to enable specific features for testing
// e.g., ?features=newAuthFlow,bulkOrders
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const featuresParam = urlParams.get('features');
  
  if (featuresParam) {
    const features = featuresParam.split(',');
    
    if (features.includes('newAuthFlow')) {
      overrideFlags.enableNewAuthFlow = true;
    }
    if (features.includes('bulkOrders')) {
      overrideFlags.enableBulkOrderProcessing = true;
    }
    // Add more feature flag overrides as needed
  }
}

// Combine the flags based on environment
export const featureFlags: FeatureFlags = {
  ...defaultFeatureFlags,
  ...(isStaging ? stagingFeatureFlags : {}),
  ...overrideFlags,
};

// Hook for accessing feature flags in components
export function useFeature<K extends keyof FeatureFlags>(feature: K): boolean {
  return featureFlags[feature];
}

// Helper function to check if a feature is enabled
export function isFeatureEnabled<K extends keyof FeatureFlags>(feature: K): boolean {
  return featureFlags[feature];
}
