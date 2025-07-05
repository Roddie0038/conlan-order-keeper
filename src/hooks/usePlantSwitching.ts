import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plant } from '@/contexts/PlantContext';

interface PlantSwitchLogEntry {
  from_plant: string;
  to_plant: string;
  switch_reason?: string;
  session_id?: string;
}

export const usePlantSwitching = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const logPlantSwitch = async (logEntry: PlantSwitchLogEntry) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('plant_switch_logs')
        .insert({
          user_id: user.id,
          user_email: user.email!,
          from_plant: logEntry.from_plant,
          to_plant: logEntry.to_plant,
          switch_reason: logEntry.switch_reason || 'user_selection',
          session_id: logEntry.session_id || crypto.randomUUID(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Failed to log plant switch:', error);
      } else {
        console.log(`Plant switch logged: ${logEntry.from_plant} → ${logEntry.to_plant}`);
      }
    } catch (error) {
      console.error('Error logging plant switch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (currentPlant: Plant, lastSwitchTime?: Date) => {
    if (!user) return;

    try {
      // Check if user preferences already exist
      const { data: existingPref } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingPref) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update({
            current_plant: currentPlant,
            last_plant_switch: lastSwitchTime?.toISOString() || new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to update user preferences:', error);
        }
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            current_plant: currentPlant,
            last_plant_switch: lastSwitchTime?.toISOString() || new Date().toISOString()
          });

        if (error) {
          console.error('Failed to create user preferences:', error);
        }
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  return {
    logPlantSwitch,
    updateUserPreferences,
    isLoading
  };
};