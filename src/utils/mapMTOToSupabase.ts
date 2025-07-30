
import { normalizeStoreForSubmission } from './storeNormalization';

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

  // CRITICAL: Deep inspection of form data for any hidden ID fields
  const suspiciousKeys = Object.keys(form).filter(key => 
    key.toLowerCase().includes('id') || 
    key.toLowerCase().includes('order')
  );
  if (suspiciousKeys.length > 0) {
    console.warn("⚠️ MTO MAPPING - Suspicious keys found in form:", suspiciousKeys);
  }

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
      originalProductNumber: form.productNumber,
      originalProduct_number: form.product_number,
      mappedProductNumber: mapped.product_number
    });
  }

  // AGGRESSIVE ID FIELD SCRUBBING
  const idFieldsToRemove = [
    'order_id', 'orderId', 'ORDER_ID', 'id', 'ID', '_id', 'uuid', 'UUID',
    'orderNumber', 'order_number', 'ORDER_NUMBER'
  ];
  
  let cleanMapped = { ...mapped };
  
  // Remove any ID fields from mapped data
  idFieldsToRemove.forEach(field => {
    if (field in cleanMapped) {
      delete cleanMapped[field];
      console.log(`🧹 MTO MAPPING - Removed ${field} field from mapped data`);
    }
  });

  // Final validation that no ID fields are present
  const remainingIdFields = Object.keys(cleanMapped).filter(key => 
    idFieldsToRemove.some(idField => 
      key.toLowerCase() === idField.toLowerCase()
    )
  );

  if (remainingIdFields.length > 0) {
    console.error("🚨 MTO MAPPING - ID fields still present after cleaning:", remainingIdFields);
    remainingIdFields.forEach(field => delete cleanMapped[field]);
  }

  console.log("🔍 MTO MAPPING - Final clean data:", {
    keys: Object.keys(cleanMapped),
    hasAnyIdFields: Object.keys(cleanMapped).some(key => key.toLowerCase().includes('id')),
    finalData: cleanMapped
  });

  return cleanMapped;
}
