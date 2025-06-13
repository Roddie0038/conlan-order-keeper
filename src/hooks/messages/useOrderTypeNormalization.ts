
/**
 * Hook for normalizing order types across the application
 */
export const useOrderTypeNormalization = () => {
  const normalizeOrderType = (orderType: string): 'orders' | 'mto_orders' | 'wheel_orders' => {
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
    
    console.warn(`[HOOK] Unknown order type: ${orderType}, defaulting to 'orders'`);
    return 'orders';
  };

  return { normalizeOrderType };
};
