// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { otClient } from '@/integrations/ot-platform/client';

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


console.log("🔍 PLANT CONTEXT - Loading plant webhooks:", PLANT_WEBHOOKS);
console.log("🔍 PLANT CONTEXT - Transfer webhook for Grand Prairie 97:", PLANT_WEBHOOKS["Grand Prairie 97"].transferRequests);
console.log("🔍 PLANT CONTEXT - Admin webhook for Grand Prairie 97:", PLANT_WEBHOOKS["Grand Prairie 97"].adminOrders);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedPlant, setSelectedPlant] = useState<Plant>('Grand Prairie 97');
  const [currentPlant, setCurrentPlant] = useState<Plant>('Grand Prairie 97');
  const [defaultPlant, setDefaultPlant] = useState<Plant>('Grand Prairie 97');
  const [loading, setLoading] = useState(true);
  const [plantStoreMap, setPlantStoreMap] = useState<typeof PLANT_WEBHOOKS>({});

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

  // Fetch plant-store associations from OT Platform
  useEffect(() => {
    const fetchPlantStoreMap = async () => {
      try {
        const { data: plants, error } = await otClient
          .from('app_plants')
          .select('plant_name, associated_stores')
          .eq('status', 'active');

        if (error) throw error;

        const map = plants?.reduce((acc, plant) => {
          acc[plant.plant_name] = plant.associated_stores || [];
          return acc;
        }, {} as Record<string, string[]>) || {};

        setPlantStoreMap(map);
        console.log("🔍 PLANT CONTEXT - Loaded plant-store map from OT Platform:", map);
      } catch (error) {
        console.error("🔍 PLANT CONTEXT - Error loading plant-store map:", error);
      }
    };

    fetchPlantStoreMap();
  }, []);

  // Load plant preferences from Supabase on user login
  useEffect(() => {
    const loadPlantPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First, get default plant from user auth metadata
        const userDefaultPlant = (user.plant as Plant) || 'Grand Prairie 97';
        setDefaultPlant(userDefaultPlant);

        // Try to load current plant from Supabase user_preferences (email-based)
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('current_plant')
          .eq('email', user.email)
          .maybeSingle();

        let plantToUse: Plant = userDefaultPlant;

        if (!error && preferences?.current_plant) {
          plantToUse = preferences.current_plant as Plant;
          console.log("🔍 PLANT CONTEXT - Loaded plant from Supabase:", plantToUse);
        } else {
          // Fallback to localStorage
          const savedPlant = localStorage.getItem('selectedPlant');
          if (savedPlant && savedPlant !== 'null') {
            plantToUse = savedPlant as Plant;
            console.log("🔍 PLANT CONTEXT - Loaded plant from localStorage:", plantToUse);
          }
        }

        setSelectedPlantSync(plantToUse);
        console.log("🔍 PLANT CONTEXT - Initialized with plant:", plantToUse);
        console.log("🔍 PLANT CONTEXT - Plant webhooks:", PLANT_WEBHOOKS[plantToUse]);
      } catch (error) {
        console.error("🔍 PLANT CONTEXT - Error loading preferences:", error);
        // Fallback to localStorage
        const savedPlant = localStorage.getItem('selectedPlant');
        const plantToUse = (savedPlant as Plant) || 'Grand Prairie 97';
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
          .eq('email', user.email)
          .maybeSingle();

        if (existing) {
          // Update existing preferences
          const { error } = await supabase
            .from('user_preferences')
            .update({
              current_plant: newPlant,
              last_plant_switch: new Date().toISOString()
            })
            .eq('email', user.email);

          if (error) {
            console.error("🔍 PLANT CONTEXT - Error updating user preferences:", error);
          }
        } else {
          // Create new preferences
          const { error } = await supabase
            .from('user_preferences')
            .insert({
              email: user.email,
              current_plant: newPlant,
              last_plant_switch: new Date().toISOString()
            } as any);

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
      PLANT_STORE_MAP: plantStoreMap
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
