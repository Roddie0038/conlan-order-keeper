
export interface WheelFormData {
  yourName: string;
  storeName: string;
  storeId: string;
  dateReceived: string;
  qtyWheels: string;
  customerName: string;
  wheelMaterial: string;
  wheelType: string;
  handHoles: string;
  wheelSize: string;
  wheelColor: string;
  scheduleArrival: string;
  userStore: string;
  storeColors: string;
  destinationPlant: string; // ✅ Added mandatory plant field
  // Cross-plant fields for elevated users
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
  // Transfer route and carrier fields
  transfer_route?: 'store->store' | 'store->plant' | 'plant->store' | 'plant->plant';
  carrier?: 'Central Transport' | 'PAM Transport' | 'Company Truck' | 'Third-Party';
  arrival_date?: string;
}
