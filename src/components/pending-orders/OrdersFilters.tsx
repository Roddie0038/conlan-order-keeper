
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStore: string;
  setFilterStore: (store: string) => void;
  uniqueStores: string[];
}

export function OrdersFilters({ 
  searchTerm, 
  setSearchTerm, 
  filterStore, 
  setFilterStore, 
  uniqueStores 
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <Input
          type="search"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {uniqueStores.map(store => (
              <SelectItem key={store} value={store}>{store}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
