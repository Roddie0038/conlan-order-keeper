/**
 * Phase 4: Utils Index
 * Export all utility functions
 */

// UUID Utils
export { generateUUID, isValidUUID, generateShortId } from './uuid/UUIDUtils';

// Date/Time Utils
export { 
  formatTimestamp,
  formatDate,
  formatTime
} from './formatting/DateTimeUtils';

// Store Normalization Utils
export {
  extractStoreNumber,
  normalizeStoreFormat,
  validateStoreFormat,
  getStoreDisplayName
} from './normalization/StoreNormalizationUtils';

export type { NormalizedStoreInfo } from './normalization/StoreNormalizationUtils';

// Form Validation
export { validateRequiredFields } from '../services/formService/FormValidationService';

// Console Migration
export { consoleToLogger } from './console-migration';