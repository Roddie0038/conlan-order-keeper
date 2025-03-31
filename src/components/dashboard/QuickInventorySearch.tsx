
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { motion } from "framer-motion";

export function QuickInventorySearch({ loaded }: { loaded: boolean }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { inventory, loading } = useInventoryContext();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const results = inventory
      .filter(
        item => 
          item.product_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={loaded ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-blue-800 to-indigo-900 border-2 border-blue-400 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Inventory Search</h2>
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="search" className="text-white mb-2 block">
                  Search for items by product number or description
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="search" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                    placeholder="Enter search term..." 
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300" 
                  />
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button 
                  onClick={() => navigate('/relentless-inventory')} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  View All Inventory
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map(item => (
                    <div key={item.id} className="p-3 bg-white/20 rounded-lg">
                      <p className="font-bold text-white">{item.product_number}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                        <p>Description: {item.description || 'N/A'}</p>
                        <p>Quantity: {item.quantity || 0}</p>
                        <p>Last Updated: {new Date(item.last_updated).toLocaleDateString() || 'N/A'}</p>
                        <p>Min Threshold: {item.min_threshold || 'N/A'}</p>
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
    </motion.div>
  );
}
