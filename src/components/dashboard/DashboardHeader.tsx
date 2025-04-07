
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();

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
    </header>
  );
}
