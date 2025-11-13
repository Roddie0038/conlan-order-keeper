// OT Platform canonical types - Single source of truth

export interface OTStore {
  store_number: string;          // "022"
  store_name: string;            // "Fort Worth 022"
  plant: string;                 // "Grand Prairie 097"
  manager_name?: string;
  manager_email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  status: string;
  is_active: boolean;
}

export interface OTStoreColor {
  store_code: string;            // "022" (PK)
  store_name: string;            // "Fort Worth 022"
  color_name: string;            // "Red"
  color_hex: string;             // "#FF0000"
}

export interface OTPlatformUser {
  email: string;
  full_name: string;
  role: string;                  // Canonical role from OT - NO local enum
  plant?: string;
  store?: string;
  can_access_ordering: boolean;
  can_access_ot: boolean;
  status: 'active' | 'inactive' | 'suspended';
  notifications_enabled: boolean;
  auth_user_id?: string;
}

export interface OTPlant {
  id: string;
  plant_code: string;            // "097"
  plant_name: string;            // "Grand Prairie 097"
  active: boolean;
  status?: string;
  associated_stores?: string[];
  enable_ordering_access?: boolean;
}

export interface OTEmailRecipient {
  id: string;
  store_number: string;
  email: string;
  role: string;
  is_active: boolean;
  email_types?: string[];
}
