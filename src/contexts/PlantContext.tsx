
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Plant = 'Grand Prairie 97' | 'Romulus 098' | 'Mulberry 99';

interface PlantContextType {
  selectedPlant: Plant;
  setSelectedPlant: (plant: Plant) => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PLANT_WEBHOOKS = {
  "Grand Prairie 97": {
    wheelOrders: "https://hooks.zapier.com/hooks/catch/21741437/2c1zjty/",
    mtoOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wax8rh/",
    transferRequests: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  },
  "Mulberry 99": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: ""
  },
  "Romulus 098": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/"
  }
};

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlant, setSelectedPlant] = useState<Plant>(() => {
    const savedPlant = localStorage.getItem('selectedPlant');
    return (savedPlant as Plant) || 'Grand Prairie 97';
  });

  useEffect(() => {
    localStorage.setItem('selectedPlant', selectedPlant);
  }, [selectedPlant]);

  return (
    <PlantContext.Provider value={{ selectedPlant, setSelectedPlant }}>
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
