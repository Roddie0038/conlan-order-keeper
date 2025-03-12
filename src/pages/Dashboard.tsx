
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Box, Package, Clock, CheckSquare, Database, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

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

  const menuItems = [
    {
      title: "NEW ORDER",
      icon: <Box size={32} />,
      path: "/pending-orders",
      color: "from-orange-500 to-red-500",
      borderColor: "border-yellow-500",
      delay: 0.1
    },
    {
      title: "MTO",
      icon: <Package size={32} />,
      path: "/mto-order",
      color: "from-blue-500 to-purple-900",
      borderColor: "border-blue-400",
      delay: 0.2
    },
    {
      title: "PENDING ORDERS",
      icon: <Clock size={32} />,
      path: "/all-pending-orders",
      color: "from-red-600 to-red-800",
      borderColor: "border-red-400",
      delay: 0.3
    },
    {
      title: "CROSS DOCK",
      icon: <ArrowRight size={32} />,
      path: "/cross-dock",
      color: "from-green-500 to-green-700",
      borderColor: "border-green-400",
      delay: 0.4
    },
    {
      title: "COMPLETED ORDERS",
      icon: <CheckSquare size={32} />,
      path: "/completed-orders",
      color: "from-yellow-500 to-yellow-700",
      borderColor: "border-yellow-400",
      delay: 0.5
    },
    {
      title: "WAREHOUSE INVENTORY",
      icon: <Database size={32} />,
      path: "/relentless-inventory",
      color: "from-yellow-400 to-amber-600",
      borderColor: "border-yellow-300",
      delay: 0.6,
      highlight: true
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
                  ${item.highlight ? 'ring-2 ring-yellow-300 ring-opacity-50 shadow-lg shadow-yellow-500/20' : ''}
                `}
              >
                {/* 3D Cube */}
                <div className="group perspective-1000">
                  <div className="relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12">
                    {/* Front face */}
                    <div className={`
                      w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg
                      bg-gradient-to-br ${item.color}
                      border-2 ${item.borderColor}
                      shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]
                      group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)]
                      transition-all duration-300
                    `}>
                      {/* Diagonal pattern overlay */}
                      <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center">
                        {item.icon}
                        <h2 className="mt-3 text-xl font-bold text-center">{item.title}</h2>
                        <span className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                          Click to Open &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Right face - simulated with shadow/gradient */}
                    <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
                    
                    {/* Bottom face - simulated with shadow/gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
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
