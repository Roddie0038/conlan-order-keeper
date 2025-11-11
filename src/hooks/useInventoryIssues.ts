import { useState, useEffect, useCallback } from "react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { useOrdersManager } from "./useOrdersManager";
import { combineOrders } from "@/pages/order-management/utils/orderCombiner";

export interface InventoryIssue {
  product_number: string;
  description: string;
  quantity: number;
  min_threshold: number;
  status: 'out_of_stock' | 'low_stock';
  affected_orders_count: number;
  affected_orders: Array<{
    id: string;
    store: string;
    quantity: number;
    order_type: string;
    timestamp: string;
  }>;
  total_quantity_requested: number;
}

export interface InventoryIssuesStats {
  total_issues: number;
  out_of_stock_items: number;
  low_stock_items: number;
  total_affected_orders: number;
  total_quantity_shortage: number;
}

export function useInventoryIssues() {
  const { inventory, loading: inventoryLoading } = useInventoryContext();
  const { orders, loading: ordersLoading } = useOrdersManager();
  const [issues, setIssues] = useState<InventoryIssue[]>([]);
  const [stats, setStats] = useState<InventoryIssuesStats>({
    total_issues: 0,
    out_of_stock_items: 0,
    low_stock_items: 0,
    total_affected_orders: 0,
    total_quantity_shortage: 0
  });
  const [error, setError] = useState<string | null>(null);

  const analyzeInventoryIssues = useCallback(() => {
    try {
      // Combine all orders
      const allOrders = combineOrders(
        orders.transfer,
        orders.mto,
        orders.wheel,
        orders.warranty
      );

      // Filter for pending orders only
      const pendingOrders = allOrders.filter(order => !order.completed);

      // Find problematic inventory items
      const problematicItems = inventory.filter(item => 
        item.quantity === 0 || item.low_stock === true
      );

      // Analyze impact for each problematic item
      const issuesAnalysis: InventoryIssue[] = problematicItems.map(item => {
        // Find all pending orders for this product
        const affectedOrders = pendingOrders
          .filter(order => order.productNumber === item.product_number)
          .map(order => ({
            id: order.id,
            store: order.store || '',
            quantity: order.quantity || 0,
            order_type: order.orderType || '',
            timestamp: order.timestamp || ''
          }));

        const totalQuantityRequested = affectedOrders.reduce(
          (sum, order) => sum + order.quantity,
          0
        );

        return {
          product_number: item.product_number,
          description: item.description,
          quantity: item.quantity,
          min_threshold: item.min_threshold,
          status: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
          affected_orders_count: affectedOrders.length,
          affected_orders: affectedOrders,
          total_quantity_requested: totalQuantityRequested
        };
      });

      // Sort by impact (most affected orders first)
      issuesAnalysis.sort((a, b) => b.affected_orders_count - a.affected_orders_count);

      // Calculate statistics
      const newStats: InventoryIssuesStats = {
        total_issues: issuesAnalysis.length,
        out_of_stock_items: issuesAnalysis.filter(i => i.status === 'out_of_stock').length,
        low_stock_items: issuesAnalysis.filter(i => i.status === 'low_stock').length,
        total_affected_orders: issuesAnalysis.reduce((sum, i) => sum + i.affected_orders_count, 0),
        total_quantity_shortage: issuesAnalysis.reduce((sum, i) => {
          if (i.status === 'out_of_stock') {
            return sum + i.total_quantity_requested;
          }
          return sum + Math.max(0, i.total_quantity_requested - i.quantity);
        }, 0)
      };

      setIssues(issuesAnalysis);
      setStats(newStats);
      setError(null);
    } catch (err) {
      console.error('Error analyzing inventory issues:', err);
      setError('Failed to analyze inventory issues');
    }
  }, [inventory, orders]);

  useEffect(() => {
    if (!inventoryLoading && !ordersLoading) {
      analyzeInventoryIssues();
    }
  }, [inventoryLoading, ordersLoading, analyzeInventoryIssues]);

  const refreshData = useCallback(() => {
    analyzeInventoryIssues();
  }, [analyzeInventoryIssues]);

  return {
    issues,
    stats,
    loading: inventoryLoading || ordersLoading,
    error,
    refreshData
  };
}
