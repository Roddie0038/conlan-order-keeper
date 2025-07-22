
import { normalizeStoreForSubmission } from './storeNormalization';

export function mapMTOToGoogleSheets(form: any, user: any, selectedPlant?: string): any {
  return {
    timestamp: new Date().toISOString(),
    name: form.name,
    store: normalizeStoreForSubmission(form.store),
    productNumber: form.productNumber,
    casingGrade: form.casingGrade,
    tireSize: form.tireSize,
    tread: form.tread || form.tireTreadNeeded,
    tireTreadNeeded: form.tireTreadNeeded,
    quantity: Number(form.quantity),
    notes: form.notes || '',
    email: form.email || form.managerEmail,
    managerEmail: form.managerEmail,
    plant: selectedPlant || user?.assignedPlant || form.plant || '', // ✅ Use selectedPlant first
    type: 'MTO',
    orderType: 'MTO',
    status: 'pending',
    description: form.description || `MTO - ${form.tireTreadNeeded || form.tread} - ${form.tireSize}`
  };
}
