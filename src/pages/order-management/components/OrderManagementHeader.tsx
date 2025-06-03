
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function OrderManagementHeader() {
  const { user } = useAuth();

  return (
    <CardHeader className="pb-4 mb-4 border-b border-gray-200">
      <CardTitle className="text-center font-bold text-4xl text-primary">Order Management</CardTitle>
      <p className="text-center text-muted-foreground">
        {user?.isAdmin ? "View and manage all orders" : `View orders for ${user?.store || "your store"}`}
      </p>
    </CardHeader>
  );
}
