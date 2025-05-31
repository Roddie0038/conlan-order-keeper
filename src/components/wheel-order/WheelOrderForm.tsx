
import { Card, CardContent } from "@/components/ui/card";
import { WheelFormInputs } from "./WheelFormInputs";
import { FormHeader } from "./components/FormHeader";
import { FormFooter } from "./components/FormFooter";
import { useWheelOrderForm } from "./hooks/useWheelOrderForm";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { toast } from "@/hooks/use-toast";

export function WheelOrderForm() {
  const {
    formData,
    managerEmail,
    isSubmitting,
    user,
    handleInputChange,
    handleStoreChange,
    handleSubmit,
    setFormData
  } = useWheelOrderForm();

  const handleLoadTemplate = (templateData: any) => {
    // When loading a template, update form data
    setFormData({
      ...templateData,
      // Always use current timestamp
      dateReceived: new Date().toISOString().split("T")[0]
    });
    
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Order Templates Section */}
      <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center">
          <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <OrderTemplate 
            type="wheel" 
            currentData={formData} 
            onLoadTemplate={handleLoadTemplate} 
          />
        </div>
      </Card>

      {/* Main Order Form */}
      <Card className="bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <FormHeader />
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8">
            <WheelFormInputs 
              formData={formData}
              managerEmail={managerEmail}
              onInputChange={handleInputChange}
              onStoreChange={handleStoreChange}
              user={user}
            />
          </CardContent>
          
          <FormFooter isSubmitting={isSubmitting} />
        </form>
      </Card>
    </div>
  );
}
