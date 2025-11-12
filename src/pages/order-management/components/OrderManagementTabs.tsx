
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, MessageSquare } from "lucide-react";
import { OrdersTableContent } from "./OrdersTableContent";
import { OrderDetailModal } from "./OrderDetailModal";
import { CombinedOrder } from "../types";
import { sortOrders } from "../utils/orderSorting";
import { ComplaintManagementTable } from "@/components/complaint/ComplaintManagementTable";
import { ComplaintDetailModal } from "@/components/complaint/ComplaintDetailModal";
import { useFetchComplaints, Complaint } from "@/hooks/useFetchComplaints";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface OrderManagementTabsProps {
  pendingOrders: CombinedOrder[];
  completedOrders: CombinedOrder[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  highlightOrder?: string | null;
  firstMatchRef?: React.RefObject<HTMLTableRowElement>;
}

export function OrderManagementTabs({
  pendingOrders,
  completedOrders,
  sortField,
  sortDirection,
  handleSort,
  highlightOrder,
  firstMatchRef
}: OrderManagementTabsProps) {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<CombinedOrder | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Fetch complaints data
  const { complaints, loading: complaintsLoading, updateComplaintStatus } = useFetchComplaints();

  // Sort the orders
  const sortedPendingOrders = sortOrders(pendingOrders, sortField, sortDirection);
  const sortedCompletedOrders = sortOrders(completedOrders, sortField, sortDirection);

  const handleOrderClick = (order: CombinedOrder) => {
    setSelectedOrder(order);
  };

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
  };

  const handleCloseComplaintModal = () => {
    setSelectedComplaint(null);
  };

  // Only show complaints tab to admin users
  const showComplaintsTab = user?.isAdmin;

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className={`grid w-full ${showComplaintsTab ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pending Orders</span>
            <span className="sm:hidden">Pending</span>
            ({sortedPendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Completed Orders</span>
            <span className="sm:hidden">Completed</span>
            ({sortedCompletedOrders.length})
          </TabsTrigger>
          {showComplaintsTab && (
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Complaints</span>
              <span className="sm:hidden">Complaints</span>
              ({complaints.length})
            </TabsTrigger>
          )}
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
                highlightOrder={highlightOrder}
                firstMatchRef={firstMatchRef}
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
                highlightOrder={highlightOrder}
                firstMatchRef={firstMatchRef}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {showComplaintsTab && (
          <TabsContent value="complaints" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {complaintsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading complaints...</span>
                  </div>
                ) : (
                  <ComplaintManagementTable
                    complaints={complaints}
                    onViewComplaint={handleComplaintClick}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={!!selectedOrder}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
      />

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        open={!!selectedComplaint}
        onClose={handleCloseComplaintModal}
        complaint={selectedComplaint}
        onUpdateStatus={updateComplaintStatus}
      />
    </>
  );
}
