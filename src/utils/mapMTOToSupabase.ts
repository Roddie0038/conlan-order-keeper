
import { normalizeStoreForSubmission } from './storeNormalization';
import { scrubMTOFormData } from './formDataScrubber';

export function mapMTOToSupabase(form: any, user: any, selectedPlant?: string): any {
  console.log("🔍 MTO MAPPING - Input form data:", {
    hasProductNumber: !!form.productNumber,
    productNumber: form.productNumber,
    hasStore: !!form.store,
    store: form.store,
    hasOrderId: 'order_id' in form,
    hasId: 'id' in form,
    orderId: form.order_id,
    id: form.id,
    formKeys: Object.keys(form),
    allFormData: JSON.stringify(form, null, 2)
  });

  // SINGLE SCRUB: Remove problematic fields and normalize critical ones
  const cleanForm = scrubMTOFormData(form);

  const mapped = {
    timestamp: new Date().toISOString(),
    name: cleanForm.name,
    store: normalizeStoreForSubmission(cleanForm.store),
    product_number: cleanForm.productNumber || cleanForm.product_number,
    casing_grade: cleanForm.casing_grade, // Already normalized in scrubber
    tire_size: cleanForm.tire_size, // Already normalized in scrubber
    tread: cleanForm.tread || cleanForm.tireTreadNeeded,
    quantity: Number(cleanForm.quantity),
    notes: cleanForm.notes || '',
    email: cleanForm.email || cleanForm.managerEmail,
    plant: selectedPlant || user?.assignedPlant || cleanForm.plant || '',
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

  // Add temporary logging before insert
  console.log('[MTO FINAL BEFORE INSERT]', {
    casing_grade: mapped.casing_grade,
    tire_size: mapped.tire_size,
    keys: Object.keys(mapped)
  });

  console.log("🔍 MTO MAPPING - Final mapped data:", {
    hasProductNumber: !!mapped.product_number,
    productNumber: mapped.product_number,
    hasStore: !!mapped.store,
    store: mapped.store,
    casing_grade: mapped.casing_grade,
    tire_size: mapped.tire_size,
    mappedKeys: Object.keys(mapped)
  });

  // Defensive validation
  if (!mapped.product_number) {
    console.error("❌ MTO MAPPING - product_number is missing after mapping:", {
      originalProductNumber: cleanForm.productNumber,
      originalProduct_number: cleanForm.product_number,
      mappedProductNumber: mapped.product_number
    });
  }

  return mapped;
}
