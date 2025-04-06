
import { Card, CardContent } from "@/components/ui/card";
import { WheelFormInputs } from "./WheelFormInputs";
import { FormHeader } from "./components/FormHeader";
import { FormFooter } from "./components/FormFooter";
import { useWheelOrderForm } from "./hooks/useWheelOrderForm";

export function WheelOrderForm() {
  const {
    formData,
    managerEmail,
    isSubmitting,
    user,
    handleInputChange,
    handleStoreChange,
    handleSubmit
  } = useWheelOrderForm();

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
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
  );
}
