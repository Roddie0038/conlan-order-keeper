import { supabase } from "@/integrations/supabase/client";
import { getAdminEmails, DEFAULT_MANAGER_EMAIL } from '@/config/emails';

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
    return "097"; // Grand Prairie plant
  } else if (storeNum >= 2 && storeNum <= 23) {
    return "099"; // Mulberry plant
  } else if (storeNum >= 8 && storeNum <= 98) {
    return "098"; // Romulus plant
  }
  
  // Default fallback to Grand Prairie
  return "097";
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
    
    // Include admin emails as fallback
    const emails = getAdminEmails();
    
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
    // Return fallback admin emails if query fails
    return getAdminEmails();
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

    // Include admin emails as fallback
    const emails = getAdminEmails();
    
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
    // Return fallback admin emails if query fails
    return getAdminEmails();
  }
};

// Get first manager email for a store (legacy compatibility)
export const getFirstManagerEmail = async (storeNumber: string): Promise<string> => {
  try {
    const recipients = await getComplaintNotificationRecipients(storeNumber);
    return recipients[0] || DEFAULT_MANAGER_EMAIL || '';
  } catch (error) {
    console.error('❌ Error getting first manager email:', error);
    return DEFAULT_MANAGER_EMAIL || '';
  }
};

// Get all manager emails for a store (legacy compatibility)
export const getManagerEmails = async (storeNumber: string): Promise<string[]> => {
  return getComplaintNotificationRecipients(storeNumber);
};

// Get escalation emails (admin emails as fallback)
export const getEscalationEmails = (): string[] => {
  return getAdminEmails();
};

// Keep the legacy function for backward compatibility
export const getAllNotificationRecipients = async (storeNumber: string): Promise<string[]> => {
  return getComplaintNotificationRecipients(storeNumber);
};
