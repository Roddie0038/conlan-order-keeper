
import type { OrderData } from "@/types/supabase-extensions";
import { normalizeStoreForSubmission } from './storeNormalization';

export function mapOrderToSupabase(form: any, user: any, selectedPlant?: string): any {
  return {
    timestamp: new Date().toISOString(),
    name: form.yourName || form.name,
    store: normalizeStoreForSubmission(form.store),
    product_number: form.productNumber,
    description: form.description,
    quantity: Number(form.quantity),
    schedule_arrival: form.scheduleArrival,
    notes: form.notes || '',
    cross_dock_type: form.crossDock,
    cross_dock_destination: normalizeStoreForSubmission(form.crossDockDestination),
    cross_dock_receiver_number: form.receiverNo,
    cross_dock_eta_date: form.etaDate,
    email: form.managersEmail || form.email,
    destination_manager_email: form.destinationManagerEmail,
    order_type: form.type || 'TRANSFER',
    status: 'pending',
    plant: selectedPlant || user?.assignedPlant || form.plant || '', // ✅ Use selectedPlant first
    status_updated_at: new Date().toISOString()
    // Removed dateReceived field as it doesn't exist in the orders table schema
  };
}
