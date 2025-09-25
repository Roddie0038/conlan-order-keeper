
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderRecord } from "@/types/orders";

interface OrdersTableHeaderProps {
  sortField: keyof OrderRecord;
  sortDirection: "asc" | "desc";
  setSortField: (field: keyof OrderRecord) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
}

export function OrdersTableHeader({ 
  sortField, 
  sortDirection, 
  setSortField, 
  setSortDirection 
}: OrdersTableHeaderProps) {
  
  const handleSort = (field: keyof OrderRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "timestamp" ? "desc" : "asc");
    }
  };

  const getSortIndicator = (field: keyof OrderRecord) => {
    return sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "";
  };
  
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort("timestamp")}
        >
          Submitted {getSortIndicator("timestamp")}
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("name")}
        >
          Name {getSortIndicator("name")}
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("store")}
        >
          Store {getSortIndicator("store")}
        </TableHead>
        <TableHead>Product #</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Qty</TableHead>
        <TableHead>Arrival</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Destination</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}
