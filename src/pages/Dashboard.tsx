
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Box, Package, Clock, CheckSquare, Database, ArrowRight, Truck, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryContext } from "@/contexts/InventoryContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { inventory, loading } = useInventoryContext();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Animate elements in after component mounts
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Filter inventory items based on search query
    const results = inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.size?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit to 5 results for compact display
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const menuItems = [
    {
      title: "NEW ORDER",
      icon: <Box size={36} />, // Increased icon size
      path: "/pending-orders",
      color: "from-orange-500 to-red-500",
      borderColor: "border-yellow-500",
      delay: 0.1,
      size: "col-span-1" // Standard size
    },
    {
      title: "MTO",
      icon: <Package size={36} />, // Increased icon size
      path: "/mto-order",
      color: "from-blue-500 to-purple-900",
      borderColor: "border-blue-400",
      delay: 0.2,
      size: "col-span-1" // Standard size
    },
    {
      title: "PENDING ORDERS",
      icon: <Clock size={32} />,
      path: "/all-pending-orders",
      color: "from-red-600 to-red-800",
      borderColor: "border-red-400",
      delay: 0.3,
      size: "col-span-1 sm:col-span-1" // Reduced size
    },
    {
      title: "CROSS DOCK",
      icon: <Truck size={36} />, // Updated to Truck icon for Cross Dock
      path: "/cross-dock",
      color: "from-green-500 to-green-700",
      borderColor: "border-green-400",
      delay: 0.4,
      size: "col-span-1"
    },
    {
      title: "COMPLETED ORDERS",
      icon: <CheckSquare size={32} />,
      path: "/completed-orders",
      color: "from-yellow-500 to-yellow-700",
      borderColor: "border-yellow-400",
      delay: 0.5,
      size: "col-span-1 sm:col-span-1" // Reduced size
    },
    {
      title: "WAREHOUSE INVENTORY",
      icon: <Database size={36} />, // Increased icon size
      path: "/relentless-inventory",
      color: "from-purple-500 to-purple-700", // Updated color scheme
      borderColor: "border-purple-400",
      delay: 0.6,
      highlight: true,
      size: "col-span-1"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
              alt="Conlan Tire Logo" 
              className="h-16 object-contain"
            />
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome to Conlan Tire, {user?.store}
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-orange-500 text-white font-bold hover:bg-orange-500"
          >
            Logout
          </Button>
        </header>

        {/* Added large logo image above menu items */}
        <div className="flex justify-center mb-10">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={loaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7 }}
            src="/lovable-uploads/7fc96df5-7b90-4a30-ab9c-e13b08d62d40.png"
            alt="Conlan Tire Logo Large"
            className="w-full max-w-3xl h-auto object-contain"
          />
        </div>

        {/* Search Inventory Box */}
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
                      Search for items by name, description or SKU
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter search term..."
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
                  <div className="md:col-span-1 flex items-end">
                    <Button 
                      onClick={() => navigate('/relentless-inventory')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      View All Inventory
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 bg-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Results</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((item) => (
                        <div key={item.id} className="p-3 bg-white/20 rounded-lg">
                          <p className="font-bold text-white">{item.name}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                            <p>SKU: {item.sku || 'N/A'}</p>
                            <p>Size: {item.size || 'N/A'}</p>
                            <p>Quantity: {item.quantity || 0}</p>
                            <p>Location: {item.location || 'N/A'}</p>
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

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={loaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: item.delay }}
                onClick={() => navigate(item.path)}
                className={`
                  cursor-pointer relative
                  ${item.size || ""}
                  ${item.highlight ? 'ring-2 ring-purple-300 ring-opacity-50 shadow-lg shadow-purple-500/20' : ''}
                `}
              >
                {/* 3D Cube */}
                <div className="group perspective-1000">
                  <div className={`
                    relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12
                    ${item.title === "WAREHOUSE INVENTORY" ? "transform-style-3d shadow-[0_20px_50px_rgba(138,43,226,0.4)]" : ""}
                  `}>
                    {/* Front face */}
                    <div className={`
                      w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg
                      bg-gradient-to-br ${item.color}
                      border-2 ${item.borderColor}
                      ${item.title === "WAREHOUSE INVENTORY" ? "border-4 border-purple-400 shadow-[0_10px_30px_rgba(138,43,226,0.3)]" : 
                        "shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)]"}
                      transition-all duration-300
                    `}>
                      {/* Diagonal pattern overlay */}
                      <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center">
                        {item.icon}
                        <h2 className={`
                          mt-3 font-bold text-center
                          ${item.title === "NEW ORDER" || item.title === "MTO" ? "text-2xl" : ""}
                          ${item.title === "PENDING ORDERS" || item.title === "COMPLETED ORDERS" ? "text-lg" : ""}
                          ${item.title === "CROSS DOCK" ? "text-2xl" : ""}
                          ${item.title === "WAREHOUSE INVENTORY" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" : ""}
                        `}>
                          {item.title}
                        </h2>
                        <span className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                          Click to Open &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Enhanced 3D effect for Warehouse Inventory */}
                    {item.title === "WAREHOUSE INVENTORY" && (
                      <>
                        {/* Right face with stronger 3D effect */}
                        <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-purple-800 rounded-r-lg"></div>
                        
                        {/* Bottom face with stronger 3D effect */}
                        <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-purple-900 rounded-b-lg"></div>
                      </>
                    )}
                    {/* Standard 3D effect for other items */}
                    {item.title !== "WAREHOUSE INVENTORY" && (
                      <>
                        {/* Right face - simulated with shadow/gradient */}
                        <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
                        
                        {/* Bottom face - simulated with shadow/gradient */}
                        <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <footer className="mt-16 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
