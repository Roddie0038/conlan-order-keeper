export type PlantCode = '097' | '098' | '099';
export type RegionalOrderType = 'transfer' | 'mto';
export type SourceMode = 'PLANT_TO_PLANT' | 'STORE_TO_PLANT';

export interface RegionalOrderPayload {
  order_type: RegionalOrderType;
  regional_enabled: true;
  destination_store_id: number | string;  // bigint id or numeric string
  source_mode: SourceMode;
  source_plant: PlantCode;
  source_store_id?: number | string | null;
  transport?: {
    carrier?: string;
    requested_pickup_at?: string | null;
    cross_dock_required?: boolean;
    notes?: string;
  };
  idempotency_key: string;        // uuid v4
}