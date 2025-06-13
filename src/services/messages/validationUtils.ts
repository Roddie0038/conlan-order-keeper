
/**
 * Safely parse a string to integer, returning null if invalid
 */
export const safeParseInt = (str: string): number | null => {
  return /^\d+$/.test(str) ? parseInt(str, 10) : null;
};

/**
 * Normalize order type to match database values
 */
export const normalizeOrderType = (orderType: string): 'orders' | 'mto_orders' | 'wheel_orders' => {
  const normalized = orderType.toLowerCase().trim();
  
  if (normalized === 'transfer' || normalized === 'orders' || normalized === 'order') {
    return 'orders';
  }
  if (normalized === 'mto' || normalized === 'mto_orders') {
    return 'mto_orders';
  }
  if (normalized === 'wheel' || normalized === 'wheel_orders') {
    return 'wheel_orders';
  }
  
  // Default fallback
  console.warn(`[MESSAGE] Unknown order type: ${orderType}, defaulting to 'orders'`);
  return 'orders';
};
