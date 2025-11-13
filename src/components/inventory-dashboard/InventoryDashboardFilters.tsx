import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryDashboardFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  plantFilter: string;
  setPlantFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  plants: string[];
  onRefresh: () => void;
}

export function InventoryDashboardFilters({
  searchTerm,
  setSearchTerm,
  plantFilter,
  setPlantFilter,
  statusFilter,
  setStatusFilter,
  plants,
  onRefresh
}: InventoryDashboardFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product number or plant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={plantFilter} onValueChange={setPlantFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Plants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plants</SelectItem>
            {plants.map((plant) => (
              <SelectItem key={plant} value={plant}>
                {plant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
