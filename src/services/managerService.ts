
import { supabase } from "@/integrations/supabase/client";

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'store_manager' | 'warehouse_manager' | 'retread_manager' | 'coordinator' | 'operations_manager' | 'office_manager';
  store_number?: string;
  plant_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type guard to validate manager role
const isValidManagerRole = (role: any): role is Manager['role'] => {
  const validRoles = ['store_manager', 'warehouse_manager', 'retread_manager', 'coordinator', 'operations_manager', 'office_manager'];
  return validRoles.includes(role);
};

// Helper function to validate and convert database records to Manager objects
const validateManager = (record: any): Manager | null => {
  if (!record || !isValidManagerRole(record.role)) {
    console.warn('Invalid manager role found:', record?.role);
    return null;
  }
  
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    store_number: record.store_number,
    plant_code: record.plant_code,
    is_active: record.is_active,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
};

/**
 * Get managers by plant code and roles
 */
export const getManagersByPlantAndRoles = async (
  plantCode: string, 
  roles: string[]
): Promise<Manager[]> => {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('plant_code', plantCode)
      .in('role', roles)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching managers:', error);
      return [];
    }

    if (!data) return [];

    // Validate and filter the results
    const validManagers = data
      .map(validateManager)
      .filter((manager): manager is Manager => manager !== null);

    return validManagers;
  } catch (error) {
    console.error('Error in getManagersByPlantAndRoles:', error);
    return [];
  }
};

/**
 * Get store manager by store number
 */
export const getStoreManager = async (storeNumber: string): Promise<Manager | null> => {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('store_number', storeNumber)
      .eq('role', 'store_manager')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching store manager:', error);
      return null;
    }

    return validateManager(data);
  } catch (error) {
    console.error('Error in getStoreManager:', error);
    return null;
  }
};

/**
 * Get plant code for store number (maps stores to plants)
 */
export const getPlantCodeForStore = (storeNumber: string): string => {
  const storeNum = parseInt(storeNumber);
  
  // Grand Prairie 97 stores
  if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(storeNum)) {
    return '97';
  }
  
  // Mulberry 99 stores  
  if ([1, 2, 3, 4, 5, 6, 7, 9, 15, 23, 40].includes(storeNum)) {
    return '99';
  }
  
  // Default to Romulus 98 for other stores
  return '98';
};

/**
 * Get complaint email recipients for a store
 */
export const getComplaintEmailRecipients = async (
  storeNumber: string,
  submitterEmail: string
): Promise<string[]> => {
  try {
    const plantCode = getPlantCodeForStore(storeNumber);
    
    // Get all relevant managers for the plant
    const managers = await getManagersByPlantAndRoles(plantCode, [
      'warehouse_manager',
      'retread_manager', 
      'coordinator',
      'operations_manager',
      'office_manager'
    ]);

    // Get store manager
    const storeManager = await getStoreManager(storeNumber);
    
    // Collect all emails
    const emails = new Set<string>();
    
    // Always include submitter
    emails.add(submitterEmail);
    
    // Add store manager if found
    if (storeManager) {
      emails.add(storeManager.email);
    }
    
    // Add all plant managers
    managers.forEach(manager => {
      emails.add(manager.email);
    });

    return Array.from(emails);
  } catch (error) {
    console.error('Error getting complaint email recipients:', error);
    
    // Fallback to original hardcoded logic if query fails
    const plantCode = getPlantCodeForStore(storeNumber);
    const fallbackEmails = [submitterEmail];
    
    if (plantCode === '97') {
      fallbackEmails.push(
        'nchilds@conlantire.com',
        'manderson@conlantire.com', 
        'gsumodobila@conlantire.com',
        'rdemarais@conlantire.com',
        'jesquivel@conlantire.com',
        'jpalos@conlantire.com'
      );
    } else if (plantCode === '99') {
      fallbackEmails.push(
        'dlee@conlantire.com',
        'wsettles@conlantire.com',
        'ogull@conlantire.com', 
        'kbriglin@conlantire.com'
      );
    } else {
      fallbackEmails.push(
        'bperry@conlantire.com',
        'chynds@conlantire.com',
        'drsanchez@conlantire.com',
        'nohernandez@conlantire.com'
      );
    }
    
    return [...new Set(fallbackEmails)];
  }
};

/**
 * Get all managers for admin interface
 */
export const getAllManagers = async (): Promise<Manager[]> => {
  try {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .order('plant_code', { ascending: true })
      .order('role', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all managers:', error);
      return [];
    }

    if (!data) return [];

    // Validate and filter the results
    const validManagers = data
      .map(validateManager)
      .filter((manager): manager is Manager => manager !== null);

    return validManagers;
  } catch (error) {
    console.error('Error in getAllManagers:', error);
    return [];
  }
};

/**
 * Create or update a manager
 */
export const upsertManager = async (manager: Omit<Manager, 'id' | 'created_at' | 'updated_at'>): Promise<Manager | null> => {
  try {
    // Ensure we have all required fields for upsert
    const managerData = {
      name: manager.name,
      email: manager.email,
      role: manager.role,
      store_number: manager.store_number || null,
      plant_code: manager.plant_code,
      is_active: manager.is_active,
    };

    const { data, error } = await supabase
      .from('managers')
      .upsert(managerData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting manager:', error);
      return null;
    }

    return validateManager(data);
  } catch (error) {
    console.error('Error in upsertManager:', error);
    return null;
  }
};

/**
 * Delete a manager
 */
export const deleteManager = async (managerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('managers')
      .delete()
      .eq('id', managerId);

    if (error) {
      console.error('Error deleting manager:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteManager:', error);
    return false;
  }
};
