
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InventoryLookupProps {
  onSelect?: (productNumber: string, description: string) => void;
}

export function InventoryLookup({ onSelect }: InventoryLookupProps) {
  const { inventory } = useInventoryContext();
  const [productQuery, setProductQuery] = useState("");
  const [sizeQuery, setSizeQuery] = useState("");
  const [productResults, setProductResults] = useState<typeof inventory>([]);
  const [sizeResults, setSizeResults] = useState<typeof inventory>([]);

  const handleProductSearch = () => {
    if (!productQuery.trim()) return;
    
    const results = inventory.filter(item => 
      item.product_number.toLowerCase().includes(productQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(productQuery.toLowerCase())
    );
    
    setProductResults(results);
  };

  const handleSizeSearch = () => {
    if (!sizeQuery.trim()) return;
    
    const results = inventory.filter(item => 
      item.description.toLowerCase().includes(sizeQuery.toLowerCase())
    );
    
    setSizeResults(results);
  };

  const handleItemSelect = (item: typeof inventory[0]) => {
    if (onSelect) {
      onSelect(item.product_number, item.description);
    }
  };

  const renderInventoryTable = (items: typeof inventory, emptyMessage: string) => {
    if (items.length === 0) {
      return <div className="text-center py-4 text-gray-500">{emptyMessage}</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.product_number}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {item.quantity} 
                {item.low_stock && 
                  <Badge variant="destructive" className="ml-2">Low Stock</Badge>
                }
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  onClick={() => handleItemSelect(item)}
                  className="bg-rose-600 hover:bg-rose-500"
                >
                  Select
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-xl font-bold mb-4">Inventory Lookup</h3>
      
      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="product">Lookup by Product Number</TabsTrigger>
          <TabsTrigger value="size">Lookup by Size</TabsTrigger>
        </TabsList>
        
        <TabsContent value="product">
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Label htmlFor="product-search">Product Number or Description</Label>
              <div className="flex mt-1">
                <Input
                  id="product-search"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Enter product number or description"
                  onKeyDown={(e) => e.key === 'Enter' && handleProductSearch()}
                />
                <Button 
                  onClick={handleProductSearch} 
                  className="ml-2 bg-rose-600 hover:bg-rose-500"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          {renderInventoryTable(productResults, "Search for a product to see results")}
        </TabsContent>
        
        <TabsContent value="size">
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Label htmlFor="size-search">Size Information</Label>
              <div className="flex mt-1">
                <Input
                  id="size-search"
                  value={sizeQuery}
                  onChange={(e) => setSizeQuery(e.target.value)}
                  placeholder="Enter size (e.g., 11R24.5)"
                  onKeyDown={(e) => e.key === 'Enter' && handleSizeSearch()}
                />
                <Button 
                  onClick={handleSizeSearch} 
                  className="ml-2 bg-rose-600 hover:bg-rose-500"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          {renderInventoryTable(sizeResults, "Search for a size to see results")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
