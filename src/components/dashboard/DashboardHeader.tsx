
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function DashboardHeader() {
  const { user } = useAuth();

  // Get store information from authenticated user
  const storeInfo = user?.storeManager;
  const displayName = storeInfo?.store_number || user?.email || 'Store';

  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
      <div className="flex items-center space-x-4">
        <img 
          src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
          alt="Conlan Tire Logo" 
          className="h-16 object-contain" 
        />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to Conlan Tire, {displayName}
          </h1>
          {storeInfo && (
            <p className="text-lg text-gray-300 mt-1">
              {storeInfo.name} - {user?.title}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  );
}
