
import { useState } from "react";
import { WheelFormData } from "../types";
import { useWheelStoreSelection } from "./useWheelStoreSelection";
import { useWheelFormSubmission } from "./useWheelFormSubmission";

export function useWheelOrderForm() {
  const [formData, setFormData] = useState<WheelFormData>({
    yourName: "",
    storeName: "",
    storeId: "",
    dateReceived: new Date().toISOString().split("T")[0],
    qtyWheels: "",
    customerName: "",
    wheelMaterial: "",
    wheelType: "",
    handHoles: "",
    wheelSize: "",
    wheelColor: "",
    scheduleArrival: "",
    userStore: "",  // Initialize the userStore field
  });

  const { managerEmail, handleStoreChange, user } = useWheelStoreSelection(formData, setFormData);
  const { isSubmitting, handleSubmit } = useWheelFormSubmission(formData, managerEmail);
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    setFormData,
    managerEmail,
    isSubmitting,
    user,
    handleInputChange,
    handleStoreChange,
    handleSubmit
  };
}
