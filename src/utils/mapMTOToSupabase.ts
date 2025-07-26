
import { normalizeStoreForSubmission } from './storeNormalization';
import { storeSanitizeForSupabase } from './storeSanitization';

export function mapMTOToSupabase(form: any, user: any, selectedPlant?: string): any {
  return {
    timestamp: new Date().toISOString(),
    name: form.name,
    store: storeSanitizeForSupabase(form.store),
    product_number: form.productNumber,
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
}
