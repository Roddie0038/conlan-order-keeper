import React, { createContext, useContext, useState } from 'react';

type OrderFormValues = Record<string, any>;

interface OrderFormStateContextType {
  values: OrderFormValues;
  setValues: (v: OrderFormValues) => void;
}

const OrderFormStateContext = createContext<OrderFormStateContextType | null>(null);

export const OrderFormStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [values, setValues] = useState<OrderFormValues>({});
  
  return (
    <OrderFormStateContext.Provider value={{ values, setValues }}>
      {children}
    </OrderFormStateContext.Provider>
  );
};

export const useOrderFormState = () => {
  const ctx = useContext(OrderFormStateContext);
  if (!ctx) {
    throw new Error('useOrderFormState must be used within OrderFormStateProvider');
  }
  return ctx;
};