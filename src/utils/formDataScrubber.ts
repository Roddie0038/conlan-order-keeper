/**
 * Comprehensive form data scrubber to remove any ID-related fields
 * that might cause database conflicts
 */

import { MTO_ALLOWED_FIELDS } from './allowedFields';

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
 * ONE SCRUB PASS ONLY - preserve critical fields in snake_case
 */
export function scrubMTOFormData(formData: any): any {
  console.log("🧹 MTO SCRUBBER - Starting single-pass MTO form data scrub");
  
  if (!formData || typeof formData !== 'object') {
    return formData;
  }

  // SINGLE PASS: Extract and normalize critical fields to snake_case
  const cg = Array.isArray(formData.casingGrade)
    ? formData.casingGrade.map(g => /casing$/i.test(g ?? '') ? g : `${g} Casing`).join(', ')
    : (formData.casingGrade ?? formData.casing_grade ?? '');

  const ts = formData.tireSize === 'custom' 
    ? (formData.customTireSize ?? formData.tire_size ?? '')
    : (formData.tireSize ?? formData.customTireSize ?? formData.tire_size ?? '');

  console.log("🧹 MTO SCRUBBER - Critical fields extracted:", {
    casing_grade: cg,
    tire_size: ts,
    has_casing_grade: !!cg,
    has_tire_size: !!ts
  });

  // Remove only problematic ID fields, keep everything else
  const scrubbed = { ...formData };
  
  PROBLEMATIC_FIELDS.forEach(field => {
    Object.keys(scrubbed).forEach(key => {
      if (key.toLowerCase() === field.toLowerCase()) {
        console.log(`🧹 MTO SCRUBBER - Removing ID field: ${key} (value: ${scrubbed[key]})`);
        delete scrubbed[key];
      }
    });
  });

  // CRITICAL: Ensure snake_case fields are set and never blank
  scrubbed.casing_grade = cg;
  scrubbed.tire_size = ts;

  console.log("🧹 MTO SCRUBBER - Single-pass complete:", {
    keys: Object.keys(scrubbed),
    casing_grade: scrubbed.casing_grade,
    tire_size: scrubbed.tire_size,
    fields_preserved: !!scrubbed.casing_grade && !!scrubbed.tire_size
  });

  return scrubbed;
}