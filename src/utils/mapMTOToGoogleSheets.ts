
import { normalizeStoreForSubmission } from './storeNormalization';

export function mapMTOToGoogleSheets(form: any, user: any, selectedPlant?: string): any {
  // Extract 3-digit store number
  const storeNumber = form.store?.match(/\d{3}$/)?.[0] || 
                      form.store?.match(/\d{2,3}/)?.[0]?.padStart(3, '0') || '';
  
  return {
    timestamp: new Date().toISOString(),
    name: form.name,
    store: normalizeStoreForSubmission(form.store),
    store_number: storeNumber,
    
    // ✅ Check BOTH camelCase and snake_case
    product_number: form.product_number ?? form.productNumber ?? '',
    casing_grade: form.casing_grade ?? form.casingGrade ?? '',
    tire_size: form.tire_size ?? form.tireSize ?? '',
    
    // Also include legacy field names for backward compat
    productNumber: form.product_number ?? form.productNumber ?? '',
    casingGrade: form.casing_grade ?? form.casingGrade ?? '',
    tireSize: form.tire_size ?? form.tireSize ?? '',
    
    tread: form.tread || form.tireTreadNeeded,
    tireTreadNeeded: form.tireTreadNeeded,
    quantity: Number(form.quantity),
    notes: form.notes || '',
    email: form.email || form.managerEmail,
    managerEmail: form.managerEmail,
    plant: selectedPlant || user?.assignedPlant || form.plant || '',
    type: 'MTO',
    orderType: 'MTO',
    status: 'pending',
    description: form.description || `MTO - ${form.tireTreadNeeded || form.tread} - ${form.tire_size || form.tireSize}`
  };
}
