
import { normalizeStoreForSubmission } from './storeNormalization';
import { scrubMTOFormData } from './formDataScrubber';
import { getPlantForStore } from './plantMapping';

export function mapMTOToSupabase(form: any, user: any, selectedPlant?: string): any {
  console.log("🔍 MTO MAPPING - Input form data:", {
    hasProductNumber: !!form.productNumber,
    productNumber: form.productNumber,
    hasStore: !!form.store,
    store: form.store,
    assignedStore: form.assignedStore,
    formKeys: Object.keys(form)
  });

  // SINGLE SCRUB: Remove problematic fields and normalize critical ones
  const cleanForm = scrubMTOFormData(form);

  // Determine actual store - use assignedStore if store is "Unassigned"
  const actualStore = cleanForm.store === "Unassigned" ? cleanForm.assignedStore : cleanForm.store;
  if (!actualStore) {
    throw new Error("Store is required. If ordering as 'Unassigned', please select an Assigned Store.");
  }

  // Normalize store and derive plant with zero-padding
  const normalizedStore = normalizeStoreForSubmission(actualStore);
  const storeNumber = normalizedStore.match(/\d+/)?.[0]?.padStart(3, '0') || '027';
  const derivedPlant = getPlantForStore(normalizedStore);

  const mapped = {
    timestamp: new Date().toISOString(),
    name: cleanForm.name,
    store: normalizedStore,
    store_number: storeNumber,
    product_number: cleanForm.productNumber || cleanForm.product_number,
    casing_grade: cleanForm.casing_grade, // Already normalized in scrubber - NEVER re-normalize
    tire_size: cleanForm.tire_size, // Already normalized in scrubber - NEVER re-normalize
    tread: cleanForm.tread || cleanForm.tireTreadNeeded,
    quantity: Number(cleanForm.quantity),
    notes: cleanForm.notes || '',
    email: cleanForm.email || cleanForm.managerEmail,
    submitted_by_name: cleanForm.name,
    submitted_by_email: cleanForm.email || cleanForm.managerEmail,
    plant: derivedPlant,
    order_type: 'mto',
    type: 'MTO',
    status: 'open',
    status_updated_at: new Date().toISOString(),
    description: cleanForm.description || `MTO - ${cleanForm.tread || cleanForm.tireTreadNeeded} - ${cleanForm.tire_size}`,
    // Cross-plant ordering fields - ensure all orders map to proper plants
    ordering_store: cleanForm.ordering_store || normalizedStore,
    ordering_plant: cleanForm.ordering_plant || derivedPlant,
    destination_plant: cleanForm.destination_plant || derivedPlant,
    // Generate idempotency key for duplicate prevention
    idempotency_key: `mto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    // NOTE: Explicitly NOT including 'id' or 'order_id' - let Supabase auto-generate the UUID
  };

  // TEMPORARY: Log payload before insert for debugging
  console.log('[MTO FINAL BEFORE INSERT]', {
    casing_grade: mapped.casing_grade,
    tire_size: mapped.tire_size,
    store: mapped.store,
    store_number: mapped.store_number,
    plant: mapped.plant,
    ordering_plant: mapped.ordering_plant,
    destination_plant: mapped.destination_plant,
    status: mapped.status,
    order_type: mapped.order_type,
    has_required_fields: !!(mapped.casing_grade && mapped.tire_size && mapped.store && mapped.plant)
  });

  // Defensive validation
  if (!mapped.product_number) {
    console.error("❌ MTO MAPPING - product_number is missing after mapping:", {
      originalProductNumber: cleanForm.productNumber,
      mappedProductNumber: mapped.product_number
    });
  }

  if (!mapped.casing_grade || !mapped.tire_size) {
    console.error("❌ MTO MAPPING - Critical fields missing:", {
      casing_grade: mapped.casing_grade,
      tire_size: mapped.tire_size
    });
  }

  return mapped;
}
