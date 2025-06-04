
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { OrdersTableContent } from "./OrdersTableContent";
import { OrderDetailModal } from "./OrderDetailModal";
import { CombinedOrder } from "../types";
import { sortOrders } from "../utils/orderSorting";

interface OrderManagementTabsProps {
  pendingOrders: CombinedOrder[];
  completedOrders: CombinedOrder[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
}

export function OrderManagementTabs({
  pendingOrders,
  completedOrders,
  sortField,
  sortDirection,
  handleSort
}: OrderManagementTabsProps) {
  const [selectedOrder, setSelectedOrder] = useState<CombinedOrder | null>(null);

  // Sort the orders
  const sortedPendingOrders = sortOrders(pendingOrders, sortField, sortDirection);
  const sortedCompletedOrders = sortOrders(completedOrders, sortField, sortDirection);

  const handleOrderClick = (order: CombinedOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Orders ({sortedPendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed Orders ({sortedCompletedOrders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <OrdersTableContent
                orders={sortedPendingOrders}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                showCompletedAt={false}
                onOrderClick={handleOrderClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <OrdersTableContent
                orders={sortedCompletedOrders}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                showCompletedAt={true}
                onOrderClick={handleOrderClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={!!selectedOrder}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </>
  );
}
