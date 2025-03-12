import { MTOOrderForm } from "@/components/mto-order/MTOOrderForm";
import { MTOPendingOrders } from "@/components/mto-order/MTOPendingOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      <Button variant="outline" onClick={handleLogout} className="fixed top-4 right-4 z-50 border-[#F97316] border-2 font-bold rounded-3xl py-[22px] px-[52px] text-zinc-50 my-0 bg-black mx-0">
        LOGOUT
      </Button>

      <header className="bg-primary text-primary-foreground py-6 mb-8 rounded-full">
        <div className="container flex flex-col items-center gap-4 rounded-full">
          <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-24 object-contain" />
          <h1 className="font-bold text-center text-white text-4xl">MTO Order Form - {user.store}</h1>
        </div>
      </header>
      
      <main className="container pb-8 py-px">
        <div className="p-6 rounded-lg shadow-lg py-[25px] bg-transparent">
          <MTOOrderForm />
        </div>
        <MTOPendingOrders />
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600 bg-white/90">
        <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
      </footer>
    </div>;
};

export default MTOOrder;
