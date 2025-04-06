
import { MTOOrderForm } from "@/components/mto-order/MTOOrderForm";
import { MTOPendingOrders } from "@/components/mto-order/MTOPendingOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
const MTOOrder = () => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  if (!user) {
    navigate('/');
    return null;
  }
  return <div className="min-h-screen bg-gray-50" style={{
    backgroundImage: "url('/lovable-uploads/1d2dc4a7-eabb-489d-8be6-adb2766a4def.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}>
      

      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-primary-foreground py-6 mb-8 rounded-lg shadow-lg">
        <div className="container flex flex-col items-center gap-4">
          <div className="h-32 w-32 flex items-center justify-center animate-float">
            <img src="/lovable-uploads/9936c75b-4159-4c84-88ee-829bdaaadb09.png" alt="MTO Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="font-bold text-center text-white text-4xl">{user.store} - MTO Order Form</h1>
        </div>
      </header>
      
      <main className="container pb-8 py-px max-w-4xl mx-auto text-black">
        <div className="rounded-lg shadow-lg py-[25px] bg-transparent">
          <MTOOrderForm />
        </div>
        <div className="mt-8">
          <MTOPendingOrders />
        </div>
      </main>
      
      <footer className="mt-16 py-6 text-center text-black bg-white/90 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
      </footer>
    </div>;
};
export default MTOOrder;
