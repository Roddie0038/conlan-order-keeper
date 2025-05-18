
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatus } from "@/components/orders/StatusBadge";

export interface StatusUpdateParams {
  orderId: number; // Updated from string to number
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  orderType: 'regular' | 'mto' | 'wheel';
}

interface UpdateDataType {
  status: string;
  status_updated_at: string;
  [key: string]: string | null;
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
      
      const updateData: UpdateDataType = {
        status: newStatus,
        status_updated_at: new Date().toISOString()
      };
      
      // Add timestamp for specific status if applicable
      if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
      }
      
      // Use type assertion to break the deep type inference chain
      const { error } = await (supabase
        .from(table) as any)
        .update(updateData)
        .eq('id', orderId);
        
      if (error) {
        toast({
          title: "Status update failed",
          description: error.message,
          variant: "destructive"
        });
        console.error("Error updating status:", error);
        return null;
      }
      
      toast({
        title: "Status Updated",
        description: `Status updated to ${newStatus.replace(/_/g, " ")}`,
        variant: "default"
      });
      
      return newStatus;
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "An unexpected error occurred",
        variant: "destructive"
      });
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
