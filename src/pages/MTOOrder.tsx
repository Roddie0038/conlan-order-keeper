
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MTOOrderForm } from "@/components/mto-order/MTOOrderForm";
import { MTOPendingOrders } from "@/components/mto-order/MTOPendingOrders";
import { Navigation } from "@/components/Navigation";

export default function MTOOrder() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <Button 
        variant="outline" 
        onClick={handleLogout} 
        className="fixed top-4 right-4 z-50 border-[#F97316] border-2 font-bold rounded-3xl py-[22px] px-[52px] text-zinc-50 my-0 bg-black mx-0"
      >
        LOGOUT
      </Button>

      <Navigation />

      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex items-center gap-4">
          <img 
            src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
            alt="Conlan Tire Logo" 
            className="h-16 object-contain rounded-full" 
          />
          <h1 className="font-extrabold text-2xl">MTO Order Form - {user?.store}</h1>
        </div>
      </header>

      <main className="container space-y-8">
        <MTOOrderForm />
        <MTOPendingOrders />
      </main>
    </div>
  );
}
