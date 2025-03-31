
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
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
  );
}
