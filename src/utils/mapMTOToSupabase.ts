
export function mapMTOToSupabase(form: any, user: any): any {
  return {
    timestamp: new Date().toISOString(),
    name: form.name,
    store: form.store,
    product_number: form.productNumber,
    casing_grade: form.casingGrade,
    tire_size: form.tireSize,
    tread: form.tread || form.tireTreadNeeded,
    quantity: Number(form.quantity),
    notes: form.notes || '',
    email: form.email || form.managerEmail,
    plant: user?.assignedPlant || form.plant || '',
    order_type: 'MTO',
    type: 'MTO',
    status: 'pending',
    status_updated_at: new Date().toISOString(),
    description: form.description || `MTO - ${form.tireTreadNeeded || form.tread} - ${form.tireSize}`
  };
}
