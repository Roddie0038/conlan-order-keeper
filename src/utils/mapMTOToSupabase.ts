export function mapMTOToSupabase(form: any, user: any): any {
  // Validation: Required fields
  if (!form.store || typeof form.store !== 'string' || form.store.trim() === '') {
    throw new Error('Store is required and must be a non-empty string');
  }
  if (!form.plant || typeof form.plant !== 'string' || form.plant.trim() === '') {
    throw new Error('Plant is required and must be a non-empty string');
  }
  if (!form.submitted_by_email || !form.submitted_by_email.includes('@')) {
    throw new Error('Valid submitted_by_email is required');
  }
  if (!form.submitted_by_name || typeof form.submitted_by_name !== 'string' || form.submitted_by_name.trim() === '') {
    throw new Error('submitted_by_name is required and must be a non-empty string');
  }

  // Build insert payload with only allowed fields
  const payload: any = {
    store: form.store.trim(),
    plant: form.plant.trim(),
    submitted_by_email: form.submitted_by_email.trim(),
    submitted_by_name: form.submitted_by_name.trim(),
    quantity: form.quantity ? parseInt(form.quantity, 10) : 1
  };

  // Optional fields
  if (form.product_number && typeof form.product_number === 'string' && form.product_number.trim() !== '') {
    payload.product_number = form.product_number.trim();
  }
  if (form.tire_size) {
    payload.tire_size = form.tire_size;
  }
  if (form.casing_grade) {
    payload.casing_grade = form.casing_grade;
  }
  if (form.tread) {
    payload.tread = form.tread;
  }
  if (form.notes) {
    payload.notes = form.notes;
  }

  // Validate quantity
  if (isNaN(payload.quantity) || payload.quantity < 1) {
    payload.quantity = 1;
  }

  // DO NOT set order_number, mto_number, normalized_store - DB triggers handle these

  return payload;
}
