
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
}
