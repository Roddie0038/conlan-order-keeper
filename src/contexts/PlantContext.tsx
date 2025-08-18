import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getPlantForStore } from '@/utils/plantMapping';

export type Plant = 'Grand Prairie 097' | 'Romulus 098' | 'Mulberry 099';

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
  "Grand Prairie 097": {
    wheelOrders: "https://hooks.zapier.com/hooks/catch/21741437/2c1zjty/",
    mtoOrders: "", // ❌ REMOVED: No longer using Zapier for MTO orders
    transferRequests: "https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  },
  "Mulberry 099": {
    wheelOrders: "",
    mtoOrders: "", // ❌ REMOVED: No longer using Zapier for MTO orders
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  },
  "Romulus 098": {
    wheelOrders: "",
    mtoOrders: "", // ❌ REMOVED: No longer using Zapier for MTO orders
    transferRequests: "",
    adminOrders: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
  }
};

// Official Plant-Store Mapping (Complete with all stores)
export const PLANT_STORE_MAP = {
  "Grand Prairie 097": [
    "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", 
    "Oklahoma City 030", "Little Rock 032", "Kansas City 033", "Laredo 035", 
    "Tulsa 036", "Austin 039"
  ],
  "Romulus 098": [
    "Toledo 008", "Detroit 011", "Grand Rapids 013", "Cleveland 018", "Chicago 041",
    "Detroit 040", "Indianapolis 042", "Milwaukee 043", "Columbus 044", 
    "Cincinnati 045", "Louisville 046", "Nashville 047"
  ],
  "Mulberry 099": [
    "Mulberry 001", "Jacksonville 002", "Miami 003", "Orlando 004", "Ocala 005",
    "Tampa 006", "Pompano Beach 007", "Fort Myers 009", "Tallahassee 015",
    "Vero Beach 021", "Sarasota 023",
    "Tampa 050", "Orlando 051", "Jacksonville 052", "Miami 053",
    "Fort Lauderdale 054", "West Palm Beach 055", "Gainesville 056"
  ]
};

console.log("🔍 PLANT CONTEXT - Loading plant webhooks:", PLANT_WEBHOOKS);
console.log("🔍 PLANT CONTEXT - Transfer webhook for Grand Prairie 097:", PLANT_WEBHOOKS["Grand Prairie 097"].transferRequests);
console.log("🔍 PLANT CONTEXT - Admin webhook for Grand Prairie 097:", PLANT_WEBHOOKS["Grand Prairie 097"].adminOrders);

// Helper function to convert plant names between formats
const convertPlantName = (plantName: string): Plant => {
  // Convert from plantMapping format to PlantContext format
  if (plantName === 'Grand Prairie 097') return 'Grand Prairie 097';
  if (plantName === 'Romulus 098') return 'Romulus 098';
  if (plantName === 'Mulberry 099') return 'Mulberry 099';
  
  // Return as-is if already in correct format
  return plantName as Plant;
};

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedPlant, setSelectedPlant] = useState<Plant>('Grand Prairie 097');
  const [currentPlant, setCurrentPlant] = useState<Plant>('Grand Prairie 097');
  const [defaultPlant, setDefaultPlant] = useState<Plant>('Grand Prairie 097');
  const [loading, setLoading] = useState(true);

  // Synchronized setter functions
  const setSelectedPlantSync = (plant: Plant) => {
    setSelectedPlant(plant);
    setCurrentPlant(plant);
  };

  const setCurrentPlantSync = (plant: Plant) => {
    setCurrentPlant(plant);
    setSelectedPlant(plant);
  };

  // Check if current order is cross-plant
  const isCrossPlantOrder = currentPlant !== defaultPlant;

  // Load plant preferences from Supabase on user login
  useEffect(() => {
    const loadPlantPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // CRITICAL FIX: Determine default plant based on user's store
        let storeBasedPlant: Plant = 'Grand Prairie 097'; // Default for all current stores
        
        if (user.store) {
          console.log("🔍 PLANT CONTEXT - Determining plant for user store:", user.store);
          const mappedPlant = getPlantForStore(user.store);
          storeBasedPlant = convertPlantName(mappedPlant || 'Grand Prairie 097');
          console.log("🔍 PLANT CONTEXT - Store-based plant mapping:", {
            userStore: user.store,
            mappedPlant,
            convertedPlant: storeBasedPlant
          });
        }

        // Set the store-based plant as the default
        setDefaultPlant(storeBasedPlant);
        console.log("🔍 PLANT CONTEXT - Default plant set to:", storeBasedPlant);

        // Try to load current plant from Supabase user_preferences
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('current_plant')
          .eq('user_id', user.id)
          .maybeSingle();

        let plantToUse: Plant = storeBasedPlant; // Default to store-based plant

        if (!error && preferences?.current_plant) {
          plantToUse = preferences.current_plant as Plant;
          console.log("🔍 PLANT CONTEXT - Loaded saved plant preference from Supabase:", plantToUse);
        } else {
          // Fallback to localStorage
          const savedPlant = localStorage.getItem('selectedPlant');
          if (savedPlant && savedPlant !== 'null') {
            plantToUse = savedPlant as Plant;
            console.log("🔍 PLANT CONTEXT - Loaded plant from localStorage:", plantToUse);
          } else {
            console.log("🔍 PLANT CONTEXT - No saved preference, using store-based default:", storeBasedPlant);
          }
        }

        setSelectedPlantSync(plantToUse);
        console.log("🔍 PLANT CONTEXT - Final initialization:", {
          defaultPlant: storeBasedPlant,
          selectedPlant: plantToUse,
          userStore: user.store
        });
        console.log("🔍 PLANT CONTEXT - Plant webhooks:", PLANT_WEBHOOKS[plantToUse]);
      } catch (error) {
        console.error("🔍 PLANT CONTEXT - Error loading preferences:", error);
        // Fallback to Grand Prairie 097 for all current stores
        const plantToUse: Plant = 'Grand Prairie 097';
        
        setDefaultPlant(plantToUse);
        setSelectedPlantSync(plantToUse);
      } finally {
        setLoading(false);
      }
    };

    loadPlantPreferences();
  }, [user]);

  // Sync plant changes to both localStorage and Supabase
  const syncPlantChange = async (newPlant: Plant) => {
    // Update localStorage immediately for UI responsiveness
    localStorage.setItem('selectedPlant', newPlant);
    localStorage.setItem('currentPlant', newPlant);
    
    console.log("🔍 PLANT CONTEXT - Syncing plant change to:", newPlant);

    // Update Supabase if user is logged in
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          // Update existing preferences
          const { error } = await supabase
            .from('user_preferences')
            .update({
              current_plant: newPlant,
              last_plant_switch: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (error) {
            console.error("🔍 PLANT CONTEXT - Error updating user preferences:", error);
          }
        } else {
          // Create new preferences
          const { error } = await supabase
            .from('user_preferences')
            .insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              current_plant: newPlant,
              last_plant_switch: new Date().toISOString()
            });

          if (error) {
            console.error("🔍 PLANT CONTEXT - Error creating user preferences:", error);
          }
        }
      } catch (error) {
        console.error("🔍 PLANT CONTEXT - Error syncing to Supabase:", error);
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      syncPlantChange(selectedPlant);
    }
  }, [selectedPlant, loading]);

  useEffect(() => {
    if (!loading) {
      syncPlantChange(currentPlant);
    }
  }, [currentPlant, loading]);

  return (
    <PlantContext.Provider value={{ 
      selectedPlant, 
      setSelectedPlant: setSelectedPlantSync, 
      currentPlant,
      setCurrentPlant: setCurrentPlantSync,
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
