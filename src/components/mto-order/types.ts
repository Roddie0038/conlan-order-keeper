export interface MTOFormData {
  id?: string;
  timestamp?: string;
  name: string;
  store: string;
  productNumber: string;
  casing_grade: string;
  tire_size: string;
  tread?: string;
  quantity: number;
  notes?: string;
  email?: string;
  plant?: string;
  destinationPlant?: string;
  managerEmail?: string;
  status?: string;
  type?: string;
  orderType?: string;
  description?: string;
  
  // Cross-plant ordering fields (optional)
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
  
  // Transfer route and carrier fields
  transfer_route?: 'store->store' | 'store->plant' | 'plant->store' | 'plant->plant';
  carrier?: 'Central Transport' | 'PAM Transport';
  // Additional transfer fields
  destination_store?: string;
  cross_dock_from?: string;
  cross_dock_to?: string;
  cross_dock_type?: string;
}