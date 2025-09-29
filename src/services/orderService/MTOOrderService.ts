/**
 * Phase 4: MTO Order Service
 * Centralized business logic for MTO order processing
 */

import { logger } from '@/utils/logger';
import { submitMTOOrder } from '@/utils/orderSubmissionUtils';
import { getFirstManagerEmail } from '@/utils/emailUtils';
import { MTOFormData } from '@/components/mto-order/mto-form-config';
import { generateUUID } from '@/utils/uuid/UUIDUtils';
import { validateRequiredFields } from '@/services/formService/FormValidationService';
import { formatTimestamp } from '@/utils/formatting/DateTimeUtils';

export interface MTOOrderServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface MTOValidationErrors {
  [key: string]: string;
}

/**
 * MTO Order Service Class
 * Handles all MTO order business logic
 */
export class MTOOrderService {
  /**
   * Validate MTO form data
   */
  static validateMTOForm(formData: MTOFormData): MTOValidationErrors {
    const errors: MTOValidationErrors = {};

    // Required field validation
    const requiredFields = {
      store: 'Store is required',
      name: 'Name is required', 
      productNumber: 'Product number is required',
      quantity: 'Quantity is required',
      destinationPlant: 'Destination plant is required'
    };

    const fieldErrors = validateRequiredFields(formData, requiredFields);
    Object.assign(errors, fieldErrors);

    // MTO-specific validations
    if (formData.casingGrade && formData.casingGrade.length === 0) {
      errors.casingGrade = 'At least one casing grade must be selected';
    }

    if (formData.quantity && isNaN(Number(formData.quantity))) {
      errors.quantity = 'Quantity must be a valid number';
    }

    logger.debug('MTO form validation completed', {
      service: 'MTOOrderService',
      hasErrors: Object.keys(errors).length > 0,
      errorCount: Object.keys(errors).length
    });

    return errors;
  }

  /**
   * Get manager email for store
   */
  static async getManagerEmail(store: string): Promise<string> {
    try {
      if (!store) {
        logger.warn('No store provided for manager email lookup', {
          service: 'MTOOrderService'
        });
        return '';
      }

      const email = await getFirstManagerEmail(store);
      
      logger.debug('Manager email retrieved', {
        service: 'MTOOrderService',
        store,
        hasEmail: !!email
      });

      return email;
    } catch (error) {
      logger.error('Failed to get manager email', {
        service: 'MTOOrderService',
        store,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return '';
    }
  }

  /**
   * Prepare MTO order for submission
   */
  static prepareMTOOrder(formData: MTOFormData): any {
    const orderId = generateUUID();
    
    // Extract 3-digit store number from store name
    const storeNumber = formData.store?.match(/\d{3}$/)?.[0] || 
                        formData.store?.match(/\d{2,3}/)?.[0]?.padStart(3, '0') || '';
    
    const preparedOrder = {
      id: orderId,
      store: formData.store,
      store_number: storeNumber,
      name: formData.name,
      timestamp: formatTimestamp(new Date()),
      product_number: formData.productNumber,
      casing_grade: Array.isArray(formData.casingGrade) 
        ? formData.casingGrade.join(', ') 
        : formData.casingGrade,
      tire_size: formData.tireSize,
      custom_tire_size: formData.customTireSize,
      tire_tread_needed: formData.tireTreadNeeded,
      quantity: parseInt(formData.quantity) || 0,
      notes: formData.notes,
      manager_email: formData.managerEmail,
      destination_plant: formData.destinationPlant,
      order_type: 'MTO'
    };

    logger.info('MTO order prepared for submission', {
      service: 'MTOOrderService',
      orderId,
      store: formData.store,
      storeNumber,
      destinationPlant: formData.destinationPlant,
      quantity: preparedOrder.quantity
    });

    return preparedOrder;
  }

  /**
   * Submit MTO order
   */
  static async submitOrder(formData: MTOFormData): Promise<MTOOrderServiceResult> {
    try {
      logger.info('Starting MTO order submission', {
        service: 'MTOOrderService',
        store: formData.store,
        destinationPlant: formData.destinationPlant
      });

      // Validate form
      const validationErrors = this.validateMTOForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        logger.warn('MTO form validation failed', {
          service: 'MTOOrderService',
          errors: validationErrors
        });
        return {
          success: false,
          error: 'Validation failed'
        };
      }

      // Prepare order data
      const orderData = this.prepareMTOOrder(formData);

      // Submit to database
      const result = await submitMTOOrder(orderData);

      if (result.success) {
        logger.info('MTO order submitted successfully', {
          service: 'MTOOrderService',
          orderId: result.data?.id,
          store: formData.store,
          destinationPlant: formData.destinationPlant
        });

        return {
          success: true,
          data: result.data
        };
      } else {
        logger.error('MTO order submission failed', {
          service: 'MTOOrderService',
          error: result.error
        });

        return {
          success: false,
          error: String(result.error) || 'Submission failed'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('MTO order submission error', {
        service: 'MTOOrderService',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create default MTO form data
   */
  static createDefaultFormData(userStore?: string): MTOFormData {
    return {
      store: userStore || "",
      name: "",
      timestamp: formatTimestamp(new Date()),
      productNumber: "",
      casingGrade: [],
      tireSize: "",
      customTireSize: "",
      tireTreadNeeded: "",
      quantity: "",
      notes: "",
      managerEmail: "",
      destinationPlant: ""
    };
  }

  /**
   * Reset form data to defaults
   */
  static resetFormData(userStore?: string): MTOFormData {
    const defaultData = this.createDefaultFormData(userStore);
    
    logger.debug('MTO form data reset', {
      service: 'MTOOrderService',
      userStore
    });

    return defaultData;
  }
}