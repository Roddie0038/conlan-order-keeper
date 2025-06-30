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
  // Extract plant code from store number mapping
  const storeNum = parseInt(storeNumber);
  
  if (storeNum >= 22 && storeNum <= 39) {
    return "97"; // Grand Prairie plant
  } else if (storeNum >= 2 && storeNum <= 23) {
    return "99"; // Mulberry plant
  } else if (storeNum >= 8 && storeNum <= 98) {
    return "98"; // Romulus plant
  }
  
  // Default fallback to Grand Prairie
  return "97";
};

export const getManagersByPlantCode = async (plantCode: string): Promise<Manager[]> => {
  try {
    console.log(`📧 Fetching managers for plant: ${plantCode}`);
    
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('plant_code', plantCode)
      .eq('is_active', true) // Only get active managers
      .in('role', ['plant_manager', 'retread_manager', 'operations_manager', 'warehouse_manager', 'office_manager', 'coordinator']);

    if (error) {
      console.error('❌ Error fetching managers:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} active managers for plant ${plantCode}`);
    return data || [];
  } catch (error) {
    console.error('❌ Manager service error:', error);
    throw error;
  }
};

export const getComplaintNotificationRecipients = async (storeNumber: string, storeManagerEmail?: string): Promise<string[]> => {
  try {
    const plantCode = getPlantCodeFromStore(storeNumber);
    const managers = await getManagersByPlantCode(plantCode);
    
    // Always include Brett Perry as fallback
    const emails = ['bperry@conlantire.com'];
    
    // Add manager emails based on their roles
    managers.forEach(manager => {
      if (manager.email && !emails.includes(manager.email)) {
        emails.push(manager.email);
      }
    });
    
    // Auto-include store manager who submitted the complaint
    if (storeManagerEmail && !emails.includes(storeManagerEmail)) {
      emails.push(storeManagerEmail);
    }
    
    console.log(`📧 Complaint notification recipients for store ${storeNumber}:`, emails);
    return emails;
  } catch (error) {
    console.error('❌ Error getting complaint notification recipients:', error);
    // Return fallback email if query fails
    return ['bperry@conlantire.com'];
  }
};

export const getWarrantyNotificationRecipients = async (storeNumber: string, storeManagerEmail?: string): Promise<string[]> => {
  try {
    const plantCode = getPlantCodeFromStore(storeNumber);
    console.log(`📧 Fetching warranty recipients for store ${storeNumber}, plant: ${plantCode}`);
    
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('plant_code', plantCode)
      .eq('is_active', true)
      .in('role', ['plant_manager', 'retread_manager', 'operations_manager', 'warehouse_manager', 'office_manager', 'coordinator']);

    if (error) {
      console.error('❌ Error fetching warranty managers:', error);
      throw error;
    }

    // Always include Brett Perry as fallback
    const emails = ['bperry@conlantire.com'];
    
    // Add manager emails prioritizing retread and plant managers for warranties
    data?.forEach(manager => {
      if (manager.email && !emails.includes(manager.email)) {
        emails.push(manager.email);
      }
    });
    
    // Auto-include store manager who submitted the warranty
    if (storeManagerEmail && !emails.includes(storeManagerEmail)) {
      emails.push(storeManagerEmail);
    }
    
    console.log(`📧 Warranty notification recipients for store ${storeNumber}:`, emails);
    return emails;
  } catch (error) {
    console.error('❌ Error getting warranty notification recipients:', error);
    // Return fallback email if query fails
    return ['bperry@conlantire.com'];
  }
};

// Keep the legacy function for backward compatibility
export const getAllNotificationRecipients = async (storeNumber: string): Promise<string[]> => {
  return getComplaintNotificationRecipients(storeNumber);
};
