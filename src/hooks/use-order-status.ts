
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatus } from "@/components/orders/StatusBadge";

export interface StatusUpdateParams {
  orderId: string;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  orderType: 'regular' | 'mto' | 'wheel';
}

export function useOrderStatus() {
  const [isUpdating, setIsUpdating] = useState(false);

  const getTimestampField = (status: OrderStatus) => {
    switch (status) {
      case 'ready_to_ship': return 'ready_to_ship_at';
      case 'in_transit': return 'in_transit_at';
      case 'received': return 'received_at';
      case 'completed': return 'completed_at';
      default: return null;
    }
  };

  const getTable = (orderType: 'regular' | 'mto' | 'wheel') => {
    if (orderType === 'mto') return 'mto_orders';
    if (orderType === 'wheel') return 'wheel_orders';
    return 'orders';
  };

  const updateOrderStatus = async ({ 
    orderId, 
    currentStatus, 
    newStatus, 
    orderType 
  }: StatusUpdateParams) => {
    if (currentStatus === newStatus) return null;
    
    setIsUpdating(true);
    
    try {
      const table = getTable(orderType);
      const timestampField = getTimestampField(newStatus);
      
      // Build update object - fix deep type instantiation by using a simpler type
      const updateData: Record<string, any> = {
        status: newStatus,
        status_updated_at: new Date().toISOString()
      };
      
      // Add timestamp for specific status if applicable
      if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', orderId);
        
      if (error) {
        toast.error("Status update failed: " + error.message);
        console.error("Error updating status:", error);
        return null;
      }
      
      toast.success("Status updated to " + newStatus.replace(/_/g, " "));
      
      return newStatus;
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateOrderStatus
  };
}
