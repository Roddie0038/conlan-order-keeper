
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";
import { ComplaintForm } from "@/components/complaint/ComplaintForm";
import { ComplaintList } from "@/components/complaint/ComplaintList";

export default function ComplaintTracking() {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleComplaintSubmitted = () => {
    setActiveTab("list");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="container py-8">
        <Card className="p-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Tracking System</h1>
            <p className="text-gray-600">Submit and track complaints for tire transfers, retreads, and work orders</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Complaints
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Complaint
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <div key={refreshKey}>
                <ComplaintList />
              </div>
            </TabsContent>

            <TabsContent value="submit" className="mt-6">
              <ComplaintForm onSuccess={handleComplaintSubmitted} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
