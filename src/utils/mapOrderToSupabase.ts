
import type { OrderFormData } from "@/types/orders";
import { normalizeStoreForSubmission } from './storeNormalization';

import { normalizePlantName } from './plantMapping';

export function mapOrderToSupabase(form: any, user: any, selectedPlant?: string): any {
  console.log("🔍 MAP TO SUPABASE - Input form data:", form);
  
  // Apply plant priority logic consistently
  const destinationPlant = form.destination_plant ? normalizePlantName(form.destination_plant) : null;
  const formDestinationPlant = form.destinationPlant ? normalizePlantName(form.destinationPlant) : null;
  
  const finalPlant = destinationPlant || formDestinationPlant || selectedPlant || user?.assignedPlant || form.plant || 'Grand Prairie 097';
  
  const mappedOrder = {
    timestamp: new Date().toISOString(),
    name: form.yourName || form.name,
    store: normalizeStoreForSubmission(form.store),
    product_number: form.productNumber,
    description: form.description,
    quantity: Number(form.quantity),
    schedule_arrival: form.scheduleArrival,
    notes: form.notes || '',
    cross_dock_type: form.crossDock,
    cross_dock_destination: normalizeStoreForSubmission(form.crossDockDestination || ''),
    cross_dock_receiver_number: form.receiverNo || '',
    cross_dock_eta_date: form.etaDate || '',
    email: form.managersEmail || form.email,
    destination_manager_email: form.destinationManagerEmail || '',
    order_type: form.type || 'TRANSFER',
    status: 'pending',
    plant: finalPlant,
    status_updated_at: new Date().toISOString(),
    // Transfer fields  
    transfer_route: form.transfer_route || (destinationPlant ? "plant->plant" : "store->store"),
    carrier: form.carrier || null,
    // Cross-plant ordering fields
    ordering_store: form.ordering_store || null,
    ordering_plant: form.ordering_plant || null,
    destination_plant: destinationPlant,
  };
  
  console.log("🔍 MAP TO SUPABASE - Mapped order:", mappedOrder);
  return mappedOrder;
}
