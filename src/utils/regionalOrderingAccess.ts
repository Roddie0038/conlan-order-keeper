import type { ExtendedUser } from '@/contexts/AuthContext';
import { REGIONAL_ORDERING_V1 } from '@/config/featureFlags';

const REGIONAL_ORDERING_ROLES = [
  'super_admin',
  'warehouse_manager', 
  'retread_manager',
  'plant_manager',
  'operations_manager'
] as const;

export function hasRegionalOrderingAccess(user: ExtendedUser | null): boolean {
  if (!REGIONAL_ORDERING_V1) return false;
  if (!user) return false;
  
  return REGIONAL_ORDERING_ROLES.includes(user.role as any);
}

export function canCreateRegionalOrder(user: ExtendedUser | null): boolean {
  return hasRegionalOrderingAccess(user);
}