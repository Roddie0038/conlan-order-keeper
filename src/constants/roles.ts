/**
 * Canonical Role System for OT Platform
 * Single source of truth for all user roles across UI, DB, and business logic
 */

// Canonical roles (snake_case for DB, labels for UI)
export const CANONICAL_ROLES = {
  super_admin: 'Super Admin',
  operations_manager: 'Operations Manager', 
  plant_manager: 'Plant Manager',
  warehouse_manager: 'Warehouse Manager',
  store_manager: 'Store Manager',
  service_manager: 'Service Manager',
  coordinator: 'Coordinator',
  retread_manager: 'Retread Manager',
  warehouse_coordinator: 'Coordinator', // Legacy role, render as Coordinator
  office_manager: 'Office Manager'
} as const;

// Legacy role mappings for backward compatibility
export const LEGACY_ROLE_MAPPINGS = {
  plant_admin: 'plant_manager', // Map legacy plant_admin to plant_manager
  warehouse_coordinator: 'coordinator' // Legacy warehouse_coordinator renders as coordinator
} as const;

// Role types
export type CanonicalRole = keyof typeof CANONICAL_ROLES;
export type LegacyRole = keyof typeof LEGACY_ROLE_MAPPINGS;
export type AllRoles = CanonicalRole | LegacyRole;

// Get display label for any role (handles legacy mapping)
export function getRoleDisplayLabel(role: string): string {
  // Handle legacy mappings first
  if (role === 'plant_admin') return CANONICAL_ROLES.plant_manager;
  if (role === 'warehouse_coordinator') return CANONICAL_ROLES.coordinator;
  
  // Return canonical label or default
  return CANONICAL_ROLES[role as CanonicalRole] || role.replace('_', ' ');
}

// Get all roles for dropdowns (excludes duplicates from legacy mappings)
export function getAllRoleOptions(): Array<{ value: string; label: string }> {
  return Object.entries(CANONICAL_ROLES).map(([value, label]) => ({
    value,
    label
  }));
}

// Check if role is elevated (for access control)
export function isElevatedRole(role: string): boolean {
  const elevatedRoles = [
    'super_admin',
    'operations_manager', 
    'plant_manager',
    'plant_admin', // Include legacy
    'warehouse_manager'
  ];
  return elevatedRoles.includes(role);
}

// Email routing role validation
export function isValidEmailRoutingRole(role: string): boolean {
  const validRoles = [
    'super_admin',
    'operations_manager',
    'plant_manager', 
    'warehouse_manager',
    'store_manager',
    'service_manager',
    'coordinator',
    'retread_manager',
    'office_manager',
    // Legacy support
    'plant_admin',
    'warehouse_coordinator'
  ];
  return validRoles.includes(role);
}

// Office manager should only receive customer complaints
export function shouldReceiveEmailType(role: string, emailType: string): boolean {
  if (role === 'office_manager') {
    return emailType === 'customer_complaints';
  }
  return true; // All other roles can receive any email type based on their configuration
}