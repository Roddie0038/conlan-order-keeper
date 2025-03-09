
/**
 * Simple in-browser API endpoints for accessing order data
 */

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Base order type
interface BaseOrder {
  id: string;
  timestamp: string;
  store: string;
}

// Exported API methods
export const orderApi = {
  /**
   * Get all pending regular orders
   */
  getPendingOrders: (): ApiResponse<any[]> => {
    try {
      const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      return {
        success: true,
        data: orders,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return {
        success: false,
        error: 'Failed to fetch pending orders',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get all MTO orders
   */
  getMTOOrders: (): ApiResponse<any[]> => {
    try {
      const orders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      return {
        success: true,
        data: orders,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching MTO orders:', error);
      return {
        success: false,
        error: 'Failed to fetch MTO orders',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get all orders (both regular and MTO)
   */
  getAllOrders: (): ApiResponse<{regular: any[], mto: any[]}> => {
    try {
      const regularOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const mtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      
      return {
        success: true,
        data: {
          regular: regularOrders,
          mto: mtoOrders
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return {
        success: false,
        error: 'Failed to fetch all orders',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Example of how to add an order programmatically (for API documentation)
   */
  addOrder: (orderData: any, type: 'regular' | 'mto'): ApiResponse<{id: string}> => {
    try {
      // Add required properties if missing
      const newOrder = {
        id: orderData.id || crypto.randomUUID(),
        timestamp: orderData.timestamp || new Date().toLocaleString(),
        ...orderData
      };
      
      // Get existing orders
      const storageKey = type === 'mto' ? 'mtoOrders' : 'pendingOrders';
      const existingOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new order
      existingOrders.push(newOrder);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(existingOrders));
      
      return {
        success: true,
        data: { id: newOrder.id },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error adding ${type} order:`, error);
      return {
        success: false,
        error: `Failed to add ${type} order`,
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Example usage in JavaScript console:
/*
// To get all orders:
const allOrders = window.orderApi.getAllOrders();
console.log(allOrders);

// To add a new order:
window.orderApi.addOrder({
  store: "Test Store",
  yourName: "API Test",
  productNumber: "API123",
  description: "Test order from API",
  quantity: "5"
}, 'regular');
*/

// Expose API to window object for external access
declare global {
  interface Window {
    orderApi: typeof orderApi;
  }
}

// Export the API to window for external access
if (typeof window !== 'undefined') {
  window.orderApi = orderApi;
}
