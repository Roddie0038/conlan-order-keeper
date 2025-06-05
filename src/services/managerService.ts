import { supabase } from "@/integrations/supabase/client";

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  store_number?: string;
  plant_code?: string;
  is_active: boolean;
}

export const getPlantCodeFromStore = (storeNumber: string): string => {
  // Extract plant code from store number
  // This maps to the plant codes in your system
  const storeNum = parseInt(storeNumber);
  
  if (storeNum >= 22 && storeNum <= 39) {
    return "97";
  } else if (storeNum >= 2 && storeNum <= 23) {
    return "99";
  } else if (storeNum >= 8 && storeNum <= 98) {
    return "98";
  }
  
  // Default fallback
  return "97";
};

export const getManagersByPlantCode = async (plantCode: string): Promise<Manager[]> => {
  try {
    console.log(`📧 Fetching managers for plant: ${plantCode}`);
    
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('plant_code', plantCode)
      .eq('is_active', true)
      .in('role', ['warehouse_manager', 'retread_manager', 'coordinator', 'office_manager']);

    if (error) {
      console.error('❌ Error fetching managers:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} managers for ${plantCode}`);
    return data || [];
  } catch (error) {
    console.error('❌ Manager service error:', error);
    throw error;
  }
};

export const getAllNotificationRecipients = async (storeNumber: string): Promise<string[]> => {
  try {
    const plantCode = getPlantCodeFromStore(storeNumber);
    const managers = await getManagersByPlantCode(plantCode);
    
    // Always include bperry@conlantire.com
    const emails = ['bperry@conlantire.com'];
    
    // Add manager emails
    managers.forEach(manager => {
      if (manager.email && !emails.includes(manager.email)) {
        emails.push(manager.email);
      }
    });
    
    console.log(`📧 Notification recipients for store ${storeNumber}:`, emails);
    return emails;
  } catch (error) {
    console.error('❌ Error getting notification recipients:', error);
    // Return fallback email if query fails
    return ['bperry@conlantire.com'];
  }
};
