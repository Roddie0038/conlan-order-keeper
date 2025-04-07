
// This file has been modified to remove WebSocket usage due to security issues
// All real-time subscriptions have been replaced with polling

/**
 * Stubbed function - previously set up real-time subscriptions
 * Now maintains compatibility with existing imports
 */
export const setupRealtimeSubscription = (callback: () => Promise<void>) => {
  console.warn('Real-time subscriptions have been replaced with polling');
  return null;
};

/**
 * Stubbed function - previously set up filtered subscriptions
 * Now maintains compatibility with existing imports
 */
export const setupLowStockSubscription = (callback: () => void) => {
  console.warn('Real-time subscriptions have been replaced with polling');
  return null;
};
