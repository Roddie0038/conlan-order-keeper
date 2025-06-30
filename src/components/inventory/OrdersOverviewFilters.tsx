
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

interface OrdersOverviewFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStore: string;
  setFilterStore: (store: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  stores: string[];
  filteredOrders: any[];
}

export function OrdersOverviewFilters({
  searchTerm,
  setSearchTerm,
  filterStore,
  setFilterStore,
  filterType,
  setFilterType,
  stores,
  filteredOrders
}: OrdersOverviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2 w-full md:w-1/3">
        <Search className="text-gray-500" size={18} />
        <Input 
          placeholder="Search orders..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Filter by store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map(store => (
              <SelectItem key={store} value={store}>{store}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="mto">MTO</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <ExportButton 
          data={filteredOrders} 
          filename="all-orders" 
          variant="outline"
        />
      </div>
    </div>
  );
}
