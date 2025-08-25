/**
 * Draft key generation utilities for order forms
 * Format: {formType}:{subType}:{store}:{plant}:{userId}
 */

export type FormType = 'standard' | 'warranty' | 'mto' | 'wheel';
export type SubType = 'transfer' | 'order' | 'complaint' | 'powder-coating';

export const makeDraftKey = (
  formType: FormType,
  subType: SubType,
  store: string,
  plant: string,
  userId: string
): string => {
  // Normalize inputs to handle variations in formatting
  const normalizedStore = store.trim();
  const normalizedPlant = plant.trim();
  
  return `${formType}:${subType}:${normalizedStore}:${normalizedPlant}:${userId}`;
};

export const parseDraftKey = (draftKey: string) => {
  try {
    const parts = draftKey.split(':');
    if (parts.length !== 5) {
      throw new Error(`Invalid draft key format: ${draftKey}`);
    }
    
    return {
      formType: parts[0] as FormType,
      subType: parts[1] as SubType,
      store: parts[2],
      plant: parts[3],
      userId: parts[4]
    };
  } catch (error) {
    console.warn('Failed to parse draft key:', draftKey, error);
    // Return a safe fallback
    return {
      formType: 'standard' as FormType,
      subType: 'transfer' as SubType,
      store: 'unknown',
      plant: 'unknown',
      userId: 'unknown'
    };
  }
};

// Legacy compatibility with existing autosave keys
export const migrateLegacyKey = (legacyKey: string, userId: string): string | null => {
  // Convert from "OP:draft:order:v2:{userId}" to new format
  const match = legacyKey.match(/^OP:draft:(\w+):v2:(.+)$/);
  if (!match) return null;
  
  const [, formType, keyUserId] = match;
  if (keyUserId !== userId) return null;
  
  // Map legacy form types to new format
  const formTypeMap: Record<string, { formType: FormType; subType: SubType }> = {
    'order': { formType: 'standard', subType: 'transfer' },
    'complaint': { formType: 'standard', subType: 'complaint' },
    'warranty': { formType: 'warranty', subType: 'order' },
    'mto': { formType: 'mto', subType: 'order' },
    'wheel-powder-coating': { formType: 'wheel', subType: 'powder-coating' }
  };
  
  const mapping = formTypeMap[formType];
  if (!mapping) return null;
  
  // For legacy keys, we'll need store/plant from context or default values
  return `${mapping.formType}:${mapping.subType}:unknown:unknown:${userId}`;
};