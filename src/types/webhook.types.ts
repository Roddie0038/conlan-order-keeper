
// Update this file to include the new test_data field

export interface CrossDockWebhookPayload {
    name: string;
    store: string;
    product_number: string;
    description: string;
    quantity: number;
    schedule_arrival: string;
    notes: string;
    email: string;
    cross_dock: "Yes" | "No";
    order_source: string;
    order_type: string;
    cross_dock_from?: string;
    cross_dock_dest?: string;
    destination_manager_email?: string;
    receiver_no?: string;
    eta_date?: string;
    test_data?: boolean; // New field for admin test mode
}
