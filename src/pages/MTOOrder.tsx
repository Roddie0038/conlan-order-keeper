import { MTOOrderForm } from "@/components/mto-order/MTOOrderForm";

const MTOOrder = () => {
  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: "url('/lovable-uploads/1d2dc4a7-eabb-489d-8be6-adb2766a4def.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="bg-primary text-primary-foreground py-6 mb-8">
        <div className="container flex flex-col items-center gap-4">
          <img 
            src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
            alt="Conlan Tire Logo" 
            className="h-24 object-contain"
          />
          <h1 className="text-3xl font-bold text-center">MTO Order Form</h1>
        </div>
      </header>
      
      <main className="container pb-8">
        <div className="bg-white/90 p-6 rounded-lg shadow-lg">
          <MTOOrderForm />
        </div>
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600 bg-white/90">
        <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MTOOrder;