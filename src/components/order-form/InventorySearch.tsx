
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { InventoryItem } from "@/types/inventory";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface InventorySearchProps {
  onSelectItem?: (item: InventoryItem) => void;
}

export const InventorySearch = ({ onSelectItem }: InventorySearchProps) => {
  const { inventory, loading } = useInventoryContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<"number" | "description">("number");

  // Clear results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    let results: InventoryItem[] = [];
    const query = searchQuery.toLowerCase();
    
    if (searchType === "number") {
      // Search by product number
      results = inventory.filter(item => 
        item.product_number.toLowerCase().includes(query)
      );
    } else {
      // Search by description and size (which is part of description)
      results = inventory.filter(item => 
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Limit to 5 results for compact display
    results = results.slice(0, 5);
    
    setSearchResults(results);
    setIsSearching(false);
    
    if (results.length === 0) {
      toast({
        title: "No results found",
        description: `No inventory items match "${searchQuery}"`,
        variant: "destructive"
      });
    }
  };

  const handleSelectItem = (item: InventoryItem) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-800 to-indigo-900 border-2 border-blue-400 shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Inventory Search</h2>
        
        <div className="flex gap-4 mb-4">
          <Button 
            onClick={() => setSearchType("number")}
            variant={searchType === "number" ? "default" : "outline"}
            className={searchType === "number" ? "bg-blue-600" : "text-white"}
          >
            Search by Product Number
          </Button>
          <Button 
            onClick={() => setSearchType("description")}
            variant={searchType === "description" ? "default" : "outline"}
            className={searchType === "description" ? "bg-blue-600" : "text-white"}
          >
            Search by Description & Size
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="inventory-search" className="text-white mb-2 block">
              {searchType === "number" 
                ? "Enter product number to search" 
                : "Enter description or size to search"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="inventory-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={searchType === "number" 
                  ? "Enter product number..." 
                  : "Enter description or size..."}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
              />
              <Button 
                onClick={handleSearch} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Results</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-white/20 rounded-lg cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={() => handleSelectItem(item)}
                  >
                    <p className="font-bold text-white">{item.product_number}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                      <p>Description: {item.description || 'N/A'}</p>
                      <p>Quantity: {item.quantity || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-white">No results found for "{searchQuery}"</p>
            </div>
          )}

          {loading && (
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-white">Loading inventory data...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
