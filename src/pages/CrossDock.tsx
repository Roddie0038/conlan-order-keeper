import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CrossDockForm } from "@/components/cross-dock/CrossDockForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function CrossDock() {
  const {
    user
  } = useAuth();
  return <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{
    backgroundImage: "url('/lovable-uploads/f9c6ac53-6ea8-4e88-b2f9-93cd6538896c.png')"
  }}>
      {/* Overlay to ensure content readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      <main className="container py-8 relative z-10">
        <div className="p-6 rounded-lg shadow-lg mx-auto bg-black/80">
          <h1 className="mb-6 text-center font-bold text-[#F97316] text-5xl">Cross Dock Paperwork</h1>
          
          <Tabs defaultValue="fillable-form" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-500">
              <TabsTrigger value="fillable-form" className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white text-2xl px-0 my-0 mx-[24px] py-0">
                Fillable Form
              </TabsTrigger>
              <TabsTrigger value="google-doc" className="data-[state=active]:text-white text-2xl bg-orange-600 hover:bg-orange-500 px-0 mx-[24px] py-0">
                Google Doc
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fillable-form">
              <CrossDockForm />
            </TabsContent>

            <TabsContent value="google-doc">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-center mb-4 text-white font-bold py-[44px] text-3xl">
                  Click below to access the printable Cross Dock documentation.
                </p>
                
                <a href="https://docs.google.com/document/d/1n6SYt0gILrQ1CI3Y2deM_6_8B7dzUIrfJ4pUrKER3GI/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="w-full max-w-md">
                  <Button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white">
                    <FileText className="mr-2 h-5 w-5" />
                    Open Cross Dock Form
                  </Button>
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>;
}