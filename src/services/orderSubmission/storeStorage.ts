
import { OrderSummary } from "@/hooks/useOrderSubmission";

/**
 * Store completed orders in local storage
 * 
 * @param orders - Array of orders to store
 * @param selectedPlant - The currently selected plant
 */
export const storeCompletedOrders = (
  orders: OrderSummary[], 
  selectedPlant: string
) => {
  const timestamp = new Date().toLocaleString();
  const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
  
  const newCompletedOrders = orders.map(order => ({
    ...order,
    id: order.id,
    timestamp: timestamp,
    plant: selectedPlant
  }));
  
  localStorage.setItem('completedOrders', JSON.stringify([...completedOrders, ...newCompletedOrders]));
};
