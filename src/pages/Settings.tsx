
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourcesTraining } from "@/components/settings/ResourcesTraining";

export default function Settings() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="container py-8">
        <Card className="p-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">
              Settings & Resources
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resources">Resources & Training</TabsTrigger>
                <TabsTrigger value="general">General Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="mt-6">
                <ResourcesTraining />
              </TabsContent>
              
              <TabsContent value="general" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">General settings coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
