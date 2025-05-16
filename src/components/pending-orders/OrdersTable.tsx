
import { Table, TableBody } from "@/components/ui/table";
import { OrdersTableHeader } from "./OrdersTableHeader";
import { OrdersTableRow } from "./OrdersTableRow";
import { OrdersEmptyState } from "./OrdersEmptyState";
import { OrderRecord } from "@/hooks/useFetchOrders";

interface OrdersTableProps {
  orders: OrderRecord[];
  sortField: keyof OrderRecord;
  sortDirection: "asc" | "desc";
  setSortField: (field: keyof OrderRecord) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
}

export function OrdersTable({ 
  orders, 
  sortField, 
  sortDirection, 
  setSortField, 
  setSortDirection 
}: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <OrdersTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
        />
        <TableBody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={10}>
                <OrdersEmptyState />
              </td>
            </tr>
          ) : (
            orders.map((order, index) => (
              <OrdersTableRow key={index} order={order} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
