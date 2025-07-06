
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to login with page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if logout fails
      window.location.href = '/login';
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      className="fixed left-4 bottom-4 z-50 font-medium flex items-center gap-2 shadow-lg border border-red-700 hover:bg-red-600 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
