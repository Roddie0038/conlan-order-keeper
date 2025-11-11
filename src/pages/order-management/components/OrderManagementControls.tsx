
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ExportButton";
import { CombinedOrder } from "../types";

interface OrderManagementControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshAllOrders: () => void;
  allOrders: CombinedOrder[];
  filterInventoryWarnings: string;
  setFilterInventoryWarnings: (value: string) => void;
}

export function OrderManagementControls({
  searchTerm,
  setSearchTerm,
  refreshAllOrders,
  allOrders,
  filterInventoryWarnings,
  setFilterInventoryWarnings
}: OrderManagementControlsProps) {
  const ordersWithWarnings = allOrders.filter(o => o.out_of_stock).length;
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-col w-full md:w-1/3">
        <Label htmlFor="search" className="text-slate-700 mb-1 font-medium">Search Orders</Label>
        <div className="flex">
          <Input
            id="search"
            placeholder="Search by product, store, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-slate-300"
          />
          <Button variant="secondary" className="ml-2 bg-slate-200 hover:bg-slate-300">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 items-end">
        <div className="flex flex-col">
          <Label htmlFor="inventory-filter" className="text-slate-700 mb-1 font-medium">Inventory Status</Label>
          <Select value={filterInventoryWarnings} onValueChange={setFilterInventoryWarnings}>
            <SelectTrigger id="inventory-filter" className="w-[200px] bg-white">
              <SelectValue placeholder="Filter by inventory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="warnings">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Inventory Warnings ({ordersWithWarnings})
                </span>
              </SelectItem>
              <SelectItem value="no-warnings">No Warnings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={refreshAllOrders}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Refresh
        </Button>
        
        <ExportButton 
          data={allOrders} 
          filename="all-orders" 
          variant="default"
          className="self-end bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export All Orders
        </ExportButton>
      </div>
    </div>
  );
}
