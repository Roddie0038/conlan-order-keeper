
import { Table, TableBody } from "@/components/ui/table";
import { OrdersTableHeader } from "./OrdersTableHeader";
import { OrdersTableRow } from "./OrdersTableRow";
import { OrdersEmptyState } from "./OrdersEmptyState";
import { OrderRecord } from "@/hooks/useFetchOrders";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface OrdersTableProps {
  orders: OrderRecord[];
  sortField: keyof OrderRecord;
  sortDirection: "asc" | "desc";
  setSortField: (field: keyof OrderRecord) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  goToPage?: (page: number) => void;
  onRowClick?: (orderId: string) => void;
}

export function OrdersTable({ 
  orders, 
  sortField, 
  sortDirection, 
  setSortField, 
  setSortDirection,
  pagination,
  goToPage,
  onRowClick
}: OrdersTableProps) {
  return (
    <div className="space-y-4">
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
                <OrdersTableRow 
                  key={index} 
                  order={order} 
                  onClick={onRowClick ? () => onRowClick(order.id) : undefined}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => goToPage && goToPage(pagination.page - 1)}
                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={pagination.page <= 1}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1; // Show pages 1-5
              } else if (pagination.page <= 3) {
                pageNum = i + 1; // Show pages 1-5
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i; // Show last 5 pages
              } else {
                pageNum = pagination.page - 2 + i; // Show 2 before and 2 after current
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => goToPage && goToPage(pageNum)}
                    isActive={pagination.page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => goToPage && goToPage(pagination.page + 1)}
                className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={pagination.page >= pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
