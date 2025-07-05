
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Plant = 'Grand Prairie 97' | 'Romulus 98' | 'Mulberry 99';

interface PlantContextType {
  selectedPlant: Plant;
  setSelectedPlant: (plant: Plant) => void;
  currentPlant: Plant;
  setCurrentPlant: (plant: Plant) => void;
  defaultPlant: Plant;
  isCrossPlantOrder: boolean;
  PLANT_WEBHOOKS: typeof PLANT_WEBHOOKS;
  PLANT_STORE_MAP: typeof PLANT_STORE_MAP;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PLANT_WEBHOOKS = {
  "Grand Prairie 97": {
    wheelOrders: "https://hooks.zapier.com/hooks/catch/21741437/2c1zjty/",
    mtoOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wax8rh/",
    transferRequests: "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  },
  "Mulberry 99": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  },
  "Romulus 98": {
    wheelOrders: "",
    mtoOrders: "",
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  }
};

// Official Plant-Store Mapping (Master Reference)
export const PLANT_STORE_MAP = {
  "Grand Prairie 97": [
    "Fort Worth 22", "Grand Prairie Service 27", "Grand Prairie 97", "Houston 28", 
    "San Antonio 29", "Laredo 35", "Austin 39", "Oklahoma City 30", 
    "Little Rock 32", "Kansas City 33", "Tulsa 36"
  ],
  "Romulus 98": [
    "Romulus 98", "Toledo 8", "Detroit 11", "Grand Rapids 13", 
    "Cleveland 18", "Chicago 41"
  ],
  "Mulberry 99": [
    "Miami 3", "Pompano Beach 7", "Fort Myers 9", "Jacksonville 002", 
    "Ocala 5", "Tallahassee 15", "Mulberry Service 1", "Mulberry 99", 
    "New Orleans 4", "Tampa 6", "Vero Beach 21", "Sarasota 23", 
    "Tampa Foam Fill 40"
  ]
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

  const [currentPlant, setCurrentPlant] = useState<Plant>(() => {
    const savedCurrentPlant = localStorage.getItem('currentPlant');
    return (savedCurrentPlant as Plant) || selectedPlant;
  });

  // Default plant comes from user's auth metadata (will be set in AuthContext)
  const [defaultPlant, setDefaultPlant] = useState<Plant>('Grand Prairie 97');

  // Check if current order is cross-plant
  const isCrossPlantOrder = currentPlant !== defaultPlant;

  useEffect(() => {
    localStorage.setItem('selectedPlant', selectedPlant);
    console.log("🔍 PLANT CONTEXT - Saving selected plant to localStorage:", selectedPlant);
    console.log("🔍 PLANT CONTEXT - Selected plant webhooks:", PLANT_WEBHOOKS[selectedPlant]);
  }, [selectedPlant]);

  useEffect(() => {
    localStorage.setItem('currentPlant', currentPlant);
    console.log("🔍 PLANT CONTEXT - Current plant changed to:", currentPlant);
  }, [currentPlant]);

  return (
    <PlantContext.Provider value={{ 
      selectedPlant, 
      setSelectedPlant, 
      currentPlant,
      setCurrentPlant,
      defaultPlant,
      isCrossPlantOrder,
      PLANT_WEBHOOKS,
      PLANT_STORE_MAP
    }}>
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
