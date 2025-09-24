
import { normalizeStoreForSubmission } from './storeNormalization';
import { scrubMTOFormData } from './formDataScrubber';

export function mapMTOToSupabase(form: any, user: any, selectedPlant?: string): any {
  console.log("🔍 MTO MAPPING - Input form data:", {
    hasProductNumber: !!form.productNumber,
    productNumber: form.productNumber,
    hasStore: !!form.store,
    store: form.store,
    formKeys: Object.keys(form)
  });

  // SINGLE SCRUB: Remove problematic fields and normalize critical ones
  const cleanForm = scrubMTOFormData(form);

  // Derive plant from store using existing mapping
  const normalizedStore = normalizeStoreForSubmission(cleanForm.store);
  const derivedPlant = selectedPlant || user?.assignedPlant || cleanForm.plant || 'Grand Prairie 097'; // Default fallback

  const mapped = {
    timestamp: new Date().toISOString(),
    name: cleanForm.name,
    store: normalizedStore,
    product_number: cleanForm.productNumber || cleanForm.product_number,
    casing_grade: cleanForm.casing_grade, // Already normalized in scrubber - NEVER re-normalize
    tire_size: cleanForm.tire_size, // Already normalized in scrubber - NEVER re-normalize
    tread: cleanForm.tread || cleanForm.tireTreadNeeded,
    quantity: Number(cleanForm.quantity),
    notes: cleanForm.notes || '',
    email: cleanForm.email || cleanForm.managerEmail,
    plant: derivedPlant,
    order_type: 'MTO',
    type: 'MTO',
    status: 'open',
    status_updated_at: new Date().toISOString(),
    description: cleanForm.description || `MTO - ${cleanForm.tread || cleanForm.tireTreadNeeded} - ${cleanForm.tire_size}`,
    // Cross-plant ordering fields (Phase 2)
    ordering_store: cleanForm.ordering_store || null,
    ordering_plant: cleanForm.ordering_plant || null,
    destination_plant: cleanForm.destination_plant || null,
    // NOTE: Explicitly NOT including 'id' or 'order_id' - let Supabase auto-generate the UUID
  };

  // TEMPORARY: Log payload before insert for debugging
  console.log('[MTO FINAL BEFORE INSERT]', {
    casing_grade: mapped.casing_grade,
    tire_size: mapped.tire_size,
    store: mapped.store,
    plant: mapped.plant,
    status: mapped.status,
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
