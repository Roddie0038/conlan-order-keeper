
import { normalizeStoreForSubmission } from './storeNormalization';

export function mapOrderToGoogleSheets(form: any, user: any, selectedPlant?: string): any {
  return {
    timestamp: new Date().toISOString(),
    yourName: form.yourName || form.name,
    store: normalizeStoreForSubmission(form.store),
    productNumber: form.productNumber,
    description: form.description,
    quantity: Number(form.quantity),
    scheduleArrival: form.scheduleArrival,
    notes: form.notes || '',
    crossDock: form.crossDock,
    crossDockDestination: normalizeStoreForSubmission(form.crossDockDestination),
    receiverNo: form.receiverNo,
    etaDate: form.etaDate,
    email: form.managersEmail || form.email,
    destinationManagerEmail: form.destinationManagerEmail,
    type: form.type || 'TRANSFER',
    status: 'pending',
    plant: selectedPlant || user?.assignedPlant || form.plant || '' // ✅ Use selectedPlant first
  };
}
