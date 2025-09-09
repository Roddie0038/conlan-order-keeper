import { OrderFormStateProvider } from "./state/OrderFormStateProvider";
import { OrderForm } from "./OrderForm";

export function OrderFormPage() {
  return (
    <OrderFormStateProvider>
      <OrderForm />
    </OrderFormStateProvider>
  );
}