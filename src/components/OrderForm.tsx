
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TabsContent } from "@/components/ui/tabs";
import { useOrderForm } from "./order-form/useOrderForm";
import { OrderHeader } from "./order-form/OrderHeader";
import { OrderTemplateSection } from "./order-form/OrderTemplateSection";
import { OrderFormInputs } from "./order-form/OrderFormInputs";
import { OrderSummaryTable } from "./order-form/OrderSummaryTable";
import { OrderSubmissionHandler } from "./order-form/OrderSubmissionHandler";

export const OrderForm = () => {
  const {
    formData,
    setFormData,
    orderSummaries,
    setOrderSummaries,
    handleSubmit,
    handleChange,
    toggleOrderSelection
  } = useOrderForm();

  return (
    <div className="space-y-8">
      <OrderHeader />
      
      <TabsContent value="order-form" className="bg-transparent">
        <OrderTemplateSection 
          formData={formData}
          setFormData={setFormData}
        />
        
        <OrderFormInputs 
          formData={formData} 
          onSubmit={handleSubmit} 
          onChange={handleChange} 
        />
        
        <OrderSummaryTable 
          orderSummaries={orderSummaries} 
          onToggleSelection={toggleOrderSelection} 
        />
        
        <OrderSubmissionHandler 
          orderSummaries={orderSummaries} 
          setOrderSummaries={setOrderSummaries} 
        />
      </TabsContent>
    </div>
  );
};
