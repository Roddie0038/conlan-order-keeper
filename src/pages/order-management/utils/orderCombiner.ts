
import { CombinedOrder } from "@/types/orders";
import type { TransferOrderRecord as OrderRecord, MTOOrderRecord, WheelOrderRecord, WarrantyOrderRecord } from "@/types/supabase-extensions";

export const combineOrders = (
  transferOrders: OrderRecord[],
  mtoOrders: MTOOrderRecord[],
  wheelOrders: WheelOrderRecord[],
  warrantyOrders: WarrantyOrderRecord[]
): CombinedOrder[] => {
  const combined: CombinedOrder[] = [];

  // Transfer orders
  transferOrders.forEach(order => {
    combined.push({
      id: `transfer-${order.id}`,
      timestamp: order.timestamp,
      name: order.name,
      store: order.store,
      productNumber: order.product_number,
      description: order.description,
      quantity: order.quantity,
      scheduleArrival: order.schedule_arrival,
      notes: order.notes,
      status: order.status || 'pending',
      completed: order.completed || false,
      orderType: 'TRANSFER',
      completedAt: order.completed_at,
    });
  });

  // MTO orders
  mtoOrders.forEach(order => {
    combined.push({
      id: `mto-${order.id}`,
      timestamp: order.timestamp,
      name: order.name,
      store: order.store,
      productNumber: order.product_number,
      description: `${order.tire_size} - ${order.tread}`,
      quantity: order.quantity,
      scheduleArrival: order.projected_delivery,
      notes: order.notes,
      status: order.status || 'pending',
      completed: order.completed || false,
      orderType: 'MTO',
      completedAt: order.completed_at,
    });
  });

  // Wheel orders
  wheelOrders.forEach(order => {
    combined.push({
      id: `wheel-${order.id}`,
      timestamp: order.timestamp,
      name: order.name,
      store: order.store,
      productNumber: `WHL-${order.id}`, // Use generated product number since field doesn't exist
      description: `${order.wheel_type || 'Unknown'} - ${order.wheel_size || 'Unknown'} - ${order.desired_color || 'Unknown'}`,
      quantity: order.quantity,
      scheduleArrival: order.due_date,
      notes: order.email_message || 'No notes', // Use email_message since notes field doesn't exist
      status: order.completed ? 'completed' : 'pending', // Derive status from completed field
      completed: order.completed || false,
      orderType: 'WHEEL_POWDER_COATING',
      completedAt: order.completed_at,
    });
  });

  // Warranty orders
  warrantyOrders.forEach(order => {
    combined.push({
      id: `warranty-${order.id}`,
      timestamp: order.created_at,
      name: order.name,
      store: order.store,
      productNumber: order.dot_number,
      description: `${order.tire_type} - ${order.tire_size}`,
      quantity: order.quantity || 1,
      scheduleArrival: 'N/A',
      notes: `Status: ${order.status}`, // Use status since notes field doesn't exist
      status: order.status || 'pending',
      completed: order.status === 'completed',
      orderType: 'WARRANTY',
      completedAt: order.updated_at, // Use updated_at since approval_date doesn't exist
    });
  });

  return combined;
};
