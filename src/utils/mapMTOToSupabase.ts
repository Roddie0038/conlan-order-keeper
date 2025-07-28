
import { normalizeStoreForSubmission } from './storeNormalization';

export function mapMTOToSupabase(form: any, user: any, selectedPlant?: string): any {
  console.log("🔍 MTO MAPPING - Input form data:", {
    hasProductNumber: !!form.productNumber,
    productNumber: form.productNumber,
    hasStore: !!form.store,
    store: form.store,
    formKeys: Object.keys(form)
  });

  const mapped = {
    timestamp: new Date().toISOString(),
    name: form.name,
    store: normalizeStoreForSubmission(form.store), // ✅ FIX: Use display format for OT Platform compatibility
    product_number: form.productNumber || form.product_number, // Handle both camelCase and snake_case
    casing_grade: form.casingGrade,
    tire_size: form.tireSize,
    tread: form.tread || form.tireTreadNeeded,
    quantity: Number(form.quantity),
    notes: form.notes || '',
    email: form.email || form.managerEmail,
    plant: selectedPlant || user?.assignedPlant || form.plant || '', // ✅ Use selectedPlant first
    order_type: 'MTO',
    type: 'MTO',
    status: 'open', // FIXED: Changed from "pending" to "open" to match Supabase constraint
    status_updated_at: new Date().toISOString(),
    description: form.description || `MTO - ${form.tireTreadNeeded || form.tread} - ${form.tireSize}`
  };

  console.log("🔍 MTO MAPPING - Output mapped data:", {
    hasProductNumber: !!mapped.product_number,
    productNumber: mapped.product_number,
    hasStore: !!mapped.store,
    store: mapped.store,
    mappedKeys: Object.keys(mapped)
  });

  // Defensive validation
  if (!mapped.product_number) {
    console.error("❌ MTO MAPPING - product_number is missing after mapping:", {
      originalProductNumber: form.productNumber,
      originalProduct_number: form.product_number,
      mappedProductNumber: mapped.product_number
    });
  }

  return mapped;
}
