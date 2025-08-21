
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

  // FIRST: Scrub the input form data to remove any problematic fields
  const cleanForm = scrubMTOFormData(form);

  const mapped = {
    timestamp: new Date().toISOString(),
    name: cleanForm.name,
    store: normalizeStoreForSubmission(cleanForm.store),
    product_number: cleanForm.productNumber || cleanForm.product_number,
    casing_grade: cleanForm.casing_grade || cleanForm.casingGrade,
    tire_size: cleanForm.tire_size || cleanForm.tireSize,
    tread: cleanForm.tread || cleanForm.tireTreadNeeded,
    quantity: Number(cleanForm.quantity),
    notes: cleanForm.notes || '',
    email: cleanForm.email || cleanForm.managerEmail,
    plant: selectedPlant || user?.assignedPlant || cleanForm.plant || '',
    order_type: 'MTO',
    type: 'MTO',
    status: 'open',
    status_updated_at: new Date().toISOString(),
    description: cleanForm.description || `MTO - ${cleanForm.tireTreadNeeded || cleanForm.tread} - ${cleanForm.tire_size || cleanForm.tireSize}`,
    // Cross-plant ordering fields (Phase 2)
    ordering_store: cleanForm.ordering_store || null,
    ordering_plant: cleanForm.ordering_plant || null,
    destination_plant: cleanForm.destination_plant || null,
    // NOTE: Explicitly NOT including 'id' or 'order_id' - let Supabase auto-generate the UUID
  };

  console.log("🔍 MTO MAPPING - Output mapped data:", {
    hasProductNumber: !!mapped.product_number,
    productNumber: mapped.product_number,
    hasStore: !!mapped.store,
    store: mapped.store,
    mappedKeys: Object.keys(mapped),
    hasOrderId: 'order_id' in mapped,
    hasId: 'id' in mapped
  });

  // Defensive validation
  if (!mapped.product_number) {
    console.error("❌ MTO MAPPING - product_number is missing after mapping:", {
      originalProductNumber: cleanForm.productNumber,
      originalProduct_number: cleanForm.product_number,
      mappedProductNumber: mapped.product_number
    });
  }

  // FINAL SCRUB: Apply the scrubber to the mapped data as well
  const finalCleanMapped = scrubMTOFormData(mapped);

  console.log("🔍 MTO MAPPING - Final clean data:", {
    keys: Object.keys(finalCleanMapped),
    hasAnyIdFields: Object.keys(finalCleanMapped).some(key => key.toLowerCase().includes('id')),
    finalData: finalCleanMapped
  });

  return finalCleanMapped;
}
