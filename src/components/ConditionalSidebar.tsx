
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function ConditionalSidebar() {
  const location = useLocation();
  
  // Don't show sidebar on dashboard and login pages
  const hideSidebar = location.pathname === "/dashboard" || location.pathname === "/login";

  if (hideSidebar) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarInset className="flex-1">
          <div className="flex h-16 items-center gap-2 px-4 border-b">
            <div className="flex-1" />
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarInset>
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
}

export { ConditionalSidebar };
