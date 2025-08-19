import { normalizeStoreForSubmission } from './storeNormalization';
import { normalizePlantName } from './plantMapping';

/**
 * Build a snake_case-only minimal payload for the secure edge function/DB insert.
 * - Omits camelCase keys entirely
 * - Omits cross-dock subfields when crossDock !== 'Yes'
 * - Ensures canonical labels for stores/plants
 * - Prevents "Unassigned" from being sent
 */
export function toSecurePayload(d: any) {
  const isUnassigned = (v: any) => {
    if (!v || typeof v !== 'string') return false;
    const s = v.trim().toLowerCase();
    return s === 'unassigned' || s === 'store unassigned';
  };

  const route: string | undefined = d?.transfer_route || d?.transferRoute;

  const ordering_store_raw = d?.ordering_store || d?.source_store || d?.sourceStore || d?.store_source;
  const ordering_plant_raw = d?.ordering_plant || d?.source_plant || d?.sourcePlant;

  const destination_store_raw = d?.store || d?.destination_store || d?.destinationStore;
  const destination_plant_raw = d?.destination_plant || d?.destinationPlant;

  // Canonicalized values
  const ordering_store = ordering_store_raw ? normalizeStoreForSubmission(ordering_store_raw) : undefined;
  const ordering_plant = ordering_plant_raw ? normalizePlantName(ordering_plant_raw) : undefined;

  let destination_store = destination_store_raw ? normalizeStoreForSubmission(destination_store_raw) : undefined;
  const destination_plant = destination_plant_raw ? normalizePlantName(destination_plant_raw) : undefined;

  // Ensure canonical city labels when STORE_NAME_MAP fallback returns "Store XXX"
  const canonicalizeStoreLabel = (label?: string, plantHint?: string) => {
    if (!label) return label;
    const m = label.match(/^Store\s+(\d{2,3})$/i);
    if (!m) return label;
    const num = m[1];
    const CANONICAL: Record<string, string> = {
      '022': 'Fort Worth 022',
      '027': 'Grand Prairie 027',
      '028': 'Houston 028',
      '029': 'San Antonio 029',
      '030': 'Oklahoma City 030',
      '032': 'Little Rock 032',
      '033': 'Kansas City 033',
      '035': 'Laredo 035',
      '036': 'Tulsa 036',
      '039': 'Austin 039',
      '040': 'Detroit 040',
      '041': 'Chicago 041',
      '042': 'Indianapolis 042',
      '043': 'Milwaukee 043',
      '044': 'Columbus 044',
      '045': 'Cincinnati 045',
      '046': 'Louisville 046',
      '047': 'Nashville 047',
      '006': 'Tampa 006',
      '004': 'Orlando 004',
      '001': 'Mulberry 001',
      '021': 'Vero Beach 021',
      '023': 'Sarasota 023',
      '002': 'Jacksonville 002',
      '005': 'Ocala 005',
      '015': 'Tallahassee 015',
      '003': 'Miami 003',
      '007': 'Pompano Beach 007',
      '009': 'Fort Myers 009',
      '008': 'Toledo 008',
      '011': 'Detroit 011',
      '013': 'Grand Rapids 013',
      '018': 'Cleveland 018',
    };
    return CANONICAL[num] || label;
  };

  // Prevent sending Unassigned destination store
  if (isUnassigned(destination_store)) destination_store = undefined;
  // Enforce canonical city labels if fallback produced generic label
  destination_store = canonicalizeStoreLabel(destination_store, destination_plant);
  const ordering_store_final = canonicalizeStoreLabel(ordering_store, ordering_plant);

  // Schedule arrival handling
  const schedule_arrival_input = d?.schedule_arrival || d?.scheduleArrival;
  const schedule_arrival = route === 'plant->plant' ? 'N/A' : schedule_arrival_input;

  // Cross-dock logic
  const crossDockFlag = d?.cross_dock || d?.crossDock;
  const includeCrossDock = crossDockFlag === 'Yes' || crossDockFlag === true;

  const base: Record<string, any> = {
    // Core identifiers
    id: d?.id,
    type: d?.order_type || d?.type || 'TRANSFER',

    // Routing
    transfer_route: route,
    ordering_store: ordering_store_final, // Source store (canonicalized)
    ordering_plant, // Source plant
    destination_plant,

    // Destination store maps to "store" column in our DB schema
    store: destination_store,

    // Order details
    product_number: d?.product_number || d?.productNumber,
    description: d?.description,
    quantity: Number(d?.quantity ?? 0) || undefined,
    schedule_arrival,
    notes: d?.notes,
    carrier: d?.carrier,

    // Contact
    name: d?.name || d?.yourName,
    email: d?.email || d?.managersEmail || d?.managerEmail,
    destination_manager_email: d?.destination_manager_email || d?.destinationManagerEmail,

    // Metadata
    timestamp: d?.timestamp || new Date().toISOString(),

    // Status
    status: d?.status || 'pending',
    plant: d?.plant ? normalizePlantName(d?.plant) : (destination_plant || ordering_plant),
    status_updated_at: d?.status_updated_at || new Date().toISOString(),
  };

  if (includeCrossDock) {
    base.cross_dock_type = d?.cross_dock_type || d?.crossDockType || d?.crossDock; // preserve provided type
    base.cross_dock_destination = d?.cross_dock_destination
      ? normalizeStoreForSubmission(d?.cross_dock_destination)
      : (d?.crossDockDestination ? normalizeStoreForSubmission(d?.crossDockDestination) : undefined);
    base.cross_dock_receiver_number = d?.cross_dock_receiver_number || d?.receiverNo;
    base.cross_dock_eta_date = d?.cross_dock_eta_date || d?.etaDate;
  }

  // Strip empty/undefined/null
  Object.keys(base).forEach((k) => {
    const v = base[k];
    if (v === '' || v === undefined || v === null || (typeof v === 'number' && isNaN(v))) {
      delete base[k];
    }
  });

  return base;
}
