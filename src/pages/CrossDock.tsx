
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Edit, FileDigit, Building } from "lucide-react";
import { CrossDockForm } from "@/components/cross-dock/CrossDockForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlant } from "@/contexts/PlantContext";

export default function CrossDock() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{
      backgroundImage: "url('/lovable-uploads/f9c6ac53-6ea8-4e88-b2f9-93cd6538896c.png')"
    }}>
      {/* Overlay to ensure content readability */}
      <div className="absolute inset-0 bg-black/60" />
      
      <main className="container py-8 relative z-10">
        <div className="max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden bg-white">
          {/* Header with plant name if available */}
          {selectedPlant && (
            <div className="bg-blue-600 px-6 py-3 text-white">
              <p className="text-center font-medium">
                Working with: <span className="font-bold">{selectedPlant}</span>
              </p>
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 text-center pt-6 pb-3">Cross Dock Paperwork</h1>
          
          <Tabs defaultValue="fillable-form" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="fillable-form" 
                  className="rounded-md py-2 px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Fillable Form
                </TabsTrigger>
                <TabsTrigger 
                  value="google-doc" 
                  className="rounded-md py-2 px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-200"
                >
                  <FileDigit className="h-4 w-4 mr-2" />
                  Physical Printout
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="fillable-form" className="py-4 px-0">
              <CrossDockForm />
            </TabsContent>

            <TabsContent value="google-doc" className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <p className="text-center mb-4 text-gray-800 font-medium text-lg max-w-lg">
                  Click below to access the printable Cross Dock documentation for physical paperwork.
                </p>
                
                <a 
                  href="https://docs.google.com/document/d/1n6SYt0gILrQ1CI3Y2deM_6_8B7dzUIrfJ4pUrKER3GI/edit?tab=t.0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full max-w-md"
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-200 shadow-md">
                    <FileText className="mr-2 h-5 w-5" />
                    Open Cross Dock Document
                  </button>
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
