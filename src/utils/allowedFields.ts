/**
 * Whitelist of allowed fields for MTO orders
 */
export const MTO_ALLOWED_FIELDS = [
  'timestamp',
  'name',
  'store',
  'product_number',
  'casing_grade',    // Keep - critical field
  'tire_size',       // Keep - critical field
  'tread',
  'quantity',
  'notes',
  'email',
  'plant',
  'order_type',
  'type',
  'status',
  'status_updated_at',
  'description',
  'ordering_store',
  'ordering_plant',
  'destination_plant',
  // Allow camelCase variants during processing
  'casingGrade',
  'tireSize',
  'customTireSize',
  'productNumber',
  'tireTreadNeeded',
  'managerEmail',
];