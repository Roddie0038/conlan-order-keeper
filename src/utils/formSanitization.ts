// Enhanced form sanitization utilities for auto-save security

import { sanitizeTextInput } from './inputValidation';

/**
 * List of sensitive field patterns that should never be stored
 */
const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /session/i,
  /cookie/i,
  /file.*upload/i,
  /attachment/i,
  /ssn/i,
  /social.*security/i,
  /credit.*card/i,
  /cvv/i,
  /pin/i
];

/**
 * Field types that should be excluded from auto-save
 */
const SENSITIVE_FIELD_TYPES = [
  'password',
  'file',
  'hidden'
];

/**
 * Check if a field name or type is sensitive
 */
export function isSensitiveField(fieldName: string, fieldType?: string): boolean {
  // Check field type first
  if (fieldType && SENSITIVE_FIELD_TYPES.includes(fieldType.toLowerCase())) {
    return true;
  }

  // Check field name patterns
  return SENSITIVE_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
}

/**
 * Sanitize form data for safe storage
 */
export function sanitizeFormData(formData: Record<string, any>, excludeFields: string[] = []): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    // Skip if in exclude list
    if (excludeFields.includes(key)) {
      continue;
    }

    // Skip sensitive fields
    if (isSensitiveField(key)) {
      continue;
    }

    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Handle different value types
    if (typeof value === 'string') {
      const sanitizedValue = sanitizeTextInput(value);
      if (sanitizedValue.trim()) {
        sanitized[key] = sanitizedValue;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      const sanitizedArray = value
        .filter(item => item !== null && item !== undefined)
        .map(item => typeof item === 'string' ? sanitizeTextInput(item) : item)
        .filter(item => typeof item !== 'string' || item.trim());
      
      if (sanitizedArray.length > 0) {
        sanitized[key] = sanitizedArray;
      }
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      const sanitizedObject = sanitizeFormData(value, excludeFields);
      if (Object.keys(sanitizedObject).length > 0) {
        sanitized[key] = sanitizedObject;
      }
    }
  }

  return sanitized;
}

/**
 * Check if form data contains meaningful values for saving
 */
export function hasMeaningfulData(formData: Record<string, any>, excludeFields: string[] = []): boolean {
  const sanitized = sanitizeFormData(formData, excludeFields);
  
  return Object.values(sanitized).some(value => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'boolean') {
      return value === true;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return false;
  });
}

/**
 * Get default exclude fields for forms
 */
export function getDefaultExcludeFields(): string[] {
  return [
    'password',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'sessionId',
    'file',
    'upload',
    'attachment',
    'fileUpload',
    'documentUpload',
    'imageUpload'
  ];
}