
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTableContent } from "./OrdersTableContent";
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
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
        <TabsTrigger value="pending" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          Pending Orders ({pendingOrders.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          Completed Orders ({completedOrders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <OrdersTableContent
          orders={sortOrders(pendingOrders, sortField, sortDirection)}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          showCompletedAt={false}
        />
      </TabsContent>

      <TabsContent value="completed">
        <OrdersTableContent
          orders={sortOrders(completedOrders, sortField, sortDirection)}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          showCompletedAt={true}
        />
      </TabsContent>
    </Tabs>
  );
}
