
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { CombinedOrder } from "../types";

interface OrderManagementControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshAllOrders: () => void;
  allOrders: CombinedOrder[];
}

export function OrderManagementControls({
  searchTerm,
  setSearchTerm,
  refreshAllOrders,
  allOrders
}: OrderManagementControlsProps) {
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
      
      <div className="flex gap-2">
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
