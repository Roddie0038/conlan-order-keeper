// src/lib/mappers.ts
// Tiny helpers to normalize unknown DB values to your UI's shapes.
// This is intentionally permissive to get you compiling again.

export const toStr = (v: unknown) =>
  v === null || v === undefined ? "" : String(v);

export const toNum = (v: unknown) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ----- Complaints -----
export type ComplaintUI = {
  id: string;
  store_number: string;
  store_name: string;
  submitted_by: string;
  submitted_by_name: string;
  submitted_by_email: string;
  status: string;
  priority: string;
  description: string;
  resolution_notes: string;
  complaint_type: string;
  issue_type: string;
  identified_concern: string;
  date_submitted: string;
  created_at: string;
  updated_at: string;
  resolved_at: string;
};

export const mapComplaintRow = (r: any): ComplaintUI => ({
  id: toStr(r.id),
  store_number: toStr(r.store_number ?? r.storeNumber ?? r.store_no),
  store_name: toStr(r.store_name ?? r.storeName ?? ""),
  submitted_by: toStr(r.submitted_by ?? r.submittedBy ?? r.submitted_by_email ?? ""),
  submitted_by_name: toStr(r.submitted_by_name ?? r.submitted_by ?? ""),
  submitted_by_email: toStr(r.submitted_by_email ?? ""),
  status: toStr(r.status ?? "open"),
  priority: toStr(r.priority ?? "normal"),
  description: toStr(r.description ?? ""),
  resolution_notes: toStr(r.resolution_notes ?? ""),
  complaint_type: toStr(r.complaint_type ?? ""),
  issue_type: toStr(r.issue_type ?? ""),
  identified_concern: toStr(r.identified_concern ?? ""),
  date_submitted: toStr(r.date_submitted ?? r.created_at ?? new Date().toISOString()),
  created_at: toStr(r.created_at ?? ""),
  updated_at: toStr(r.updated_at ?? ""),
  resolved_at: toStr(r.resolved_at ?? "")
});

// ----- Orders (generic) -----
export type OrderRecordUI = {
  id: string;
  order_number: string;
  product_number?: string;
  store: string;
  plant: string;
  normalized_store?: string;
  submitted_by_email: string;
  submitted_by_name: string;
  role?: string;
  order_type?: string;
  status?: string;
  quantity?: number;
  timestamp?: string;
  schedule_arrival?: string;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export const mapOrderRow = (r: any): OrderRecordUI => ({
  id: toStr(r.id),
  order_number: toStr(r.order_number ?? r.mto_number ?? r.warranty_number ?? r.wheel_number ?? ""),
  product_number: r.product_number ? toStr(r.product_number) : undefined,
  store: toStr(r.store ?? ""),
  plant: toStr(r.plant ?? ""),
  normalized_store: r.normalized_store ? toStr(r.normalized_store) : undefined,
  submitted_by_email: toStr(r.submitted_by_email ?? ""),
  submitted_by_name: toStr(r.submitted_by_name ?? r.name ?? ""),
  role: r.role ? toStr(r.role) : undefined,
  order_type: r.order_type ? toStr(r.order_type) : undefined,
  status: r.status ? toStr(r.status) : undefined,
  quantity: r.quantity !== undefined ? toNum(r.quantity) : undefined,
  timestamp: r.timestamp ? toStr(r.timestamp) : undefined,
  schedule_arrival: r.schedule_arrival ? toStr(r.schedule_arrival) : undefined,
  name: r.name ? toStr(r.name) : undefined,
  description: r.description ? toStr(r.description) : undefined,
  created_at: toStr(r.created_at ?? ""),
  updated_at: toStr(r.updated_at ?? "")
});

// ----- Users -----
export type PlatformUserUI = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  store: string;
  plant: string;
  normalized_store: string;
  platform?: string;
  created_at: string;
  updated_at: string;
};

export const mapPlatformUserRow = (r: any): PlatformUserUI => ({
  id: toStr(r.id),
  email: toStr(r.email ?? ""),
  full_name: toStr(r.full_name ?? ""),
  role: toStr(r.role ?? ""),
  status: toStr(r.status ?? ""),
  store: toStr(r.store ?? ""),
  plant: toStr(r.plant ?? ""),
  normalized_store: toStr(r.normalized_store ?? ""),
  platform: r.platform ? toStr(r.platform) : undefined,
  created_at: toStr(r.created_at ?? ""),
  updated_at: toStr(r.updated_at ?? "")
});

// ----- Activity Log -----
export type ActivityLogUI = {
  id: string;
  action: string;
  affected_user: string;
  performed_by: string;
  platform: string;
  description: string;
  metadata: any;
  timestamp: string;
};

export const mapActivityLogRow = (r: any): ActivityLogUI => ({
  id: toStr(r.id),
  action: toStr(r.action ?? ""),
  affected_user: toStr(r.affected_user ?? ""),
  performed_by: toStr(r.performed_by ?? ""),
  platform: toStr(r.platform ?? ""),
  description: toStr(r.description ?? ""),
  metadata: r.metadata ?? {},
  timestamp: toStr(r.timestamp ?? r.created_at ?? "")
});

// ----- Plant preference -----
export type PlantPrefUI = {
  id?: string;
  user_id: string;
  current_plant: string;
  last_plant_switch?: string;
  created_at?: string;
  updated_at?: string;
};

export const mapPlantPrefRow = (r: any): PlantPrefUI => ({
  id: r.id !== undefined ? toStr(r.id) : undefined,
  user_id: toStr(r.user_id ?? ""),
  current_plant: toStr(r.current_plant ?? ""),
  last_plant_switch: r.last_plant_switch ? toStr(r.last_plant_switch) : undefined,
  created_at: r.created_at ? toStr(r.created_at) : undefined,
  updated_at: r.updated_at ? toStr(r.updated_at) : undefined
});
