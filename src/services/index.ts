/**
 * Phase 4: Services Index
 * Export all service layers
 */

// Order Services
export { OrderFormService } from './orderService/OrderFormService';
export { MTOOrderService } from './orderService/MTOOrderService';
export { WheelOrderService } from './orderService/WheelOrderService';
export { WarrantyOrderService } from './orderService/WarrantyOrderService';

// Form Services
export { FormValidationService } from './formService/FormValidationService';
export { TemplateService } from './formService/TemplateService';

// Service Types
export type { 
  OrderFormServiceResult,
  OrderSummary,
  OrderValidationErrors
} from './orderService/OrderFormService';

export type {
  MTOOrderServiceResult,
  MTOValidationErrors
} from './orderService/MTOOrderService';

export type {
  WheelOrderServiceResult,
  WheelValidationErrors
} from './orderService/WheelOrderService';

export type {
  TemplateServiceResult,
  OrderType
} from './formService/TemplateService';