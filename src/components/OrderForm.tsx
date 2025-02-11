
import { useAuth } from "@/contexts/AuthContext";
import { storeManagerEmails } from "./order-form/formConfig";
import { OrderFormInputs } from "./order-form/OrderFormInputs";
import { OrderSummaryTable } from "./order-form/OrderSummaryTable";
import { OrderSubmissionHandler } from "./order-form/OrderSubmissionHandler";
import { useState } from "react";
import type { OrderSummary } from "./order-form/types";

// Note: Using default export instead of named export
const OrderForm = () => {
  const { user } = useAuth();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);

  return (
    <div className="space-y-8">
      <OrderFormInputs 
        orderSummaries={orderSummaries} 
        setOrderSummaries={setOrderSummaries} 
      />
      
      <OrderSummaryTable 
        orderSummaries={orderSummaries}
        setOrderSummaries={setOrderSummaries}
      />
      
      <OrderSubmissionHandler 
        orderSummaries={orderSummaries}
        setOrderSummaries={setOrderSummaries}
      />
    </div>
  );
};

export default OrderForm;
