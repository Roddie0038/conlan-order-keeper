
import { OrderRecord, MTOOrderRecord, WheelOrderRecord, WarrantyOrderRecord, CombinedOrder } from "@/types/orders";

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
      productNumber: order.productnumber,
      description: `${order.wheeltype} - ${order.wheelsize} - ${order.desiredcolor}`,
      quantity: order.quantity,
      scheduleArrival: order.schedulearrival,
      notes: order.notes,
      status: order.status || 'pending',
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
      quantity: 1,
      scheduleArrival: 'N/A',
      notes: order.notes,
      status: order.status || 'open',
      completed: order.status === 'completed',
      orderType: 'WARRANTY',
      completedAt: order.completed_at,
    });
  });

  return combined;
};
