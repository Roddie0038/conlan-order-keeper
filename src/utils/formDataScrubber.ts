/**
 * Comprehensive form data scrubber to remove any ID-related fields
 * that might cause database conflicts
 */

const PROBLEMATIC_FIELDS = [
  'order_id', 'orderId', 'ORDER_ID', 'id', 'ID', '_id', 'uuid', 'UUID',
  'orderNumber', 'order_number', 'ORDER_NUMBER', 'order-id', 'Order_Id'
];

export function scrubFormData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  console.log("🧹 FORM SCRUBBER - Input data:", {
    keys: Object.keys(data),
    problematicFields: Object.keys(data).filter(key => 
      PROBLEMATIC_FIELDS.some(field => 
        key.toLowerCase() === field.toLowerCase()
      )
    ),
    data
  });

  // Create a clean copy
  const scrubbed = { ...data };

  // Remove any problematic fields
  PROBLEMATIC_FIELDS.forEach(field => {
    // Check for exact matches and case variations
    Object.keys(scrubbed).forEach(key => {
      if (key.toLowerCase() === field.toLowerCase()) {
        console.log(`🧹 FORM SCRUBBER - Removing field: ${key} (value: ${scrubbed[key]})`);
        delete scrubbed[key];
      }
    });
  });

  // Double-check for any remaining problematic fields
  const remainingProblematic = Object.keys(scrubbed).filter(key => 
    PROBLEMATIC_FIELDS.some(field => 
      key.toLowerCase() === field.toLowerCase()
    )
  );

  if (remainingProblematic.length > 0) {
    console.error("🚨 FORM SCRUBBER - Problematic fields still remain:", remainingProblematic);
    remainingProblematic.forEach(key => delete scrubbed[key]);
  }

  console.log("🧹 FORM SCRUBBER - Output data:", {
    originalKeys: Object.keys(data),
    scrubbedKeys: Object.keys(scrubbed),
    removedFields: Object.keys(data).filter(key => !Object.keys(scrubbed).includes(key)),
    hasAnyIdFields: Object.keys(scrubbed).some(key => key.toLowerCase().includes('id'))
  });

  return scrubbed;
}

/**
 * Specifically for MTO form data scrubbing before Supabase submission
 */
export function scrubMTOFormData(formData: any): any {
  console.log("🧹 MTO SCRUBBER - Starting comprehensive MTO form data scrub");
  
  // Apply general scrubbing first
  let clean = scrubFormData(formData);
  
  // Additional MTO-specific checks
  if ('casing_grade' in clean && Array.isArray(clean.casing_grade) && clean.casing_grade.length === 0) {
    // Convert empty array to undefined to avoid validation issues
    clean.casing_grade = undefined;
  }
  
  if ('tire_size' in clean && !clean.tire_size) {
    clean.tire_size = undefined;
  }

  // Final safety check - ensure no ID fields whatsoever
  const finalCheck = Object.keys(clean).filter(key => 
    key.toLowerCase().includes('id') ||
    key.toLowerCase().includes('order')
  );

  if (finalCheck.length > 0) {
    console.warn("🚨 MTO SCRUBBER - ID-related fields found after scrubbing:", finalCheck);
    // Only allow specific safe fields that contain 'id' but aren't problematic
    const allowedFields = ['productNumber', 'product_number']; // These are safe
    finalCheck.forEach(key => {
      if (!allowedFields.some(allowed => key.toLowerCase().includes(allowed.toLowerCase()))) {
        console.log(`🧹 MTO SCRUBBER - Removing suspicious field: ${key}`);
        delete clean[key];
      }
    });
  }

  console.log("🧹 MTO SCRUBBER - Final clean data:", clean);
  return clean;
}