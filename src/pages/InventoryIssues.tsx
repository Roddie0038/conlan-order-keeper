import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { InventoryIssuesHeader } from "./inventory-issues/InventoryIssuesHeader";
import { InventoryIssuesStats } from "./inventory-issues/InventoryIssuesStats";
import { InventoryIssuesTable } from "./inventory-issues/InventoryIssuesTable";
import { useInventoryIssues } from "@/hooks/useInventoryIssues";

export default function InventoryIssues() {
  const { issues, stats, loading, error, refreshData } = useInventoryIssues();

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative" 
        style={{
          backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="flex items-center justify-center min-h-[400px] relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium text-white">Loading inventory issues...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative" 
        style={{
          backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg relative z-10">
          <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading inventory issues</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative" 
      style={{
        backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="container py-8 relative z-10">
        <Card className="p-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
          <InventoryIssuesHeader onRefresh={refreshData} />
          
          <CardContent className="p-0">
            <InventoryIssuesStats stats={stats} />
            <InventoryIssuesTable issues={issues} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
