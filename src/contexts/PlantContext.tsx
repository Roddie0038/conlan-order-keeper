
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Plant = 'Grand Prairie 97' | 'Romulus 098' | 'Mulberry 99';

interface PlantContextType {
  selectedPlant: Plant;
  setSelectedPlant: (plant: Plant) => void;
  PLANT_WEBHOOKS: typeof PLANT_WEBHOOKS;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PLANT_WEBHOOKS = {
  "Grand Prairie 97": {
    wheelOrders: "https://hooks.zapier.com/hooks/catch/21741437/2c1zjty/",
    mtoOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wax8rh/",
    transferRequests: "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/" // Added new admin webhook
  },
  "Mulberry 99": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/" // Added new admin webhook
  },
  "Romulus 098": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/" // Added new admin webhook
  }
};

console.log("🔍 PLANT CONTEXT - Loading plant webhooks:", PLANT_WEBHOOKS);
console.log("🔍 PLANT CONTEXT - Transfer webhook for Grand Prairie 97:", PLANT_WEBHOOKS["Grand Prairie 97"].transferRequests);
console.log("🔍 PLANT CONTEXT - Admin webhook for Grand Prairie 97:", PLANT_WEBHOOKS["Grand Prairie 97"].adminOrders);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlant, setSelectedPlant] = useState<Plant>(() => {
    const savedPlant = localStorage.getItem('selectedPlant');
    console.log("🔍 PLANT CONTEXT - Loading saved plant from localStorage:", savedPlant);
    return (savedPlant as Plant) || 'Grand Prairie 97';
  });

  useEffect(() => {
    localStorage.setItem('selectedPlant', selectedPlant);
    console.log("🔍 PLANT CONTEXT - Saving selected plant to localStorage:", selectedPlant);
    console.log("🔍 PLANT CONTEXT - Selected plant webhooks:", PLANT_WEBHOOKS[selectedPlant]);
  }, [selectedPlant]);

  return (
    <PlantContext.Provider value={{ selectedPlant, setSelectedPlant, PLANT_WEBHOOKS }}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlant() {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
}
