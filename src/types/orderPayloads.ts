// Payload types for Standard vs Regional orders
// Clear separation of concerns and proper typing

export interface BaseOrderPayload {
  _corr?: string; // correlation ID for tracking
}

// Standard Transfer Order Payload (classic flow)
export interface StandardOrderPayload extends BaseOrderPayload {
  type: 'standard';
  order_type: 'transfer';
  store: string;
  destination_plant: string;
  product_number: string;
  quantity: string;
  description?: string;
  notes?: string;
  your_name?: string;
  managers_email?: string;
  schedule_arrival?: string | null;
  cross_dock?: 'Yes' | 'No';
  cross_dock_destination?: string | null;
  cross_dock_receiver_number?: string | null;
  cross_dock_eta_date?: string | null;
  timestamp: string;
}

// Regional Order Payload (extends existing regional interface)
export type PlantCode = '097' | '098' | '099';
export type RegionalOrderType = 'transfer' | 'mto';
export type SourceMode = 'PLANT_TO_PLANT' | 'STORE_TO_PLANT';

export interface RegionalOrderPayload extends BaseOrderPayload {
  type: 'regional';
  order_type: RegionalOrderType;
  regional_enabled: true;
  destination_store_id?: number | string | null;
  destination_plant?: string;
  fulfilled_by_plant: string;
  source_mode: SourceMode;
  source_plant: PlantCode;
  source_store_id?: number | string | null;
  is_plant_to_plant?: boolean;
  transport?: {
    carrier?: string;
    requested_pickup_at?: string | null;
    cross_dock_required?: boolean;
    notes?: string;
  };
  idempotency_key: string; // uuid v4
}

// Union type for type safety
export type OrderPayload = StandardOrderPayload | RegionalOrderPayload;