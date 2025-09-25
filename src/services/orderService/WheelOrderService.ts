/**
 * Phase 4: Wheel Order Service  
 * Centralized business logic for wheel order processing
 */

import { logger } from '@/utils/logger';
import { submitWheelOrder } from '@/utils/orderSubmissionUtils';
import { getFirstManagerEmail } from '@/utils/emailUtils';
import { WheelFormData } from '@/components/wheel-order/types';
import { generateUUID } from '@/utils/uuid/UUIDUtils';
import { validateRequiredFields } from '@/services/formService/FormValidationService';
import { formatTimestamp } from '@/utils/formatting/DateTimeUtils';

export interface WheelOrderServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface WheelValidationErrors {
  [key: string]: string;
}

/**
 * Wheel Order Service Class
 * Handles all wheel order business logic
 */
export class WheelOrderService {
  /**
   * Validate wheel form data
   */
  static validateWheelForm(formData: WheelFormData, isAdmin?: boolean): WheelValidationErrors {
    const errors: WheelValidationErrors = {};

    // Required field validation
    const requiredFields = {
      yourName: 'Name is required',
      qtyWheels: 'Quantity of wheels is required',
      customerName: 'Customer name is required',
      wheelMaterial: 'Wheel material is required',
      wheelType: 'Wheel type is required',
      handHoles: 'Hand holes specification is required',
      wheelSize: 'Wheel size is required',
      wheelColor: 'Wheel color is required',
      scheduleArrival: 'Schedule arrival is required',
      destinationPlant: 'Destination plant is required'
    };

    // Store validation only for non-admin users
    if (!isAdmin) {
      (requiredFields as any).storeName = 'Store is required';
    }

    const fieldErrors = validateRequiredFields(formData, requiredFields);
    Object.assign(errors, fieldErrors);

    // Wheel-specific validations
    if (formData.qtyWheels && isNaN(Number(formData.qtyWheels))) {
      errors.qtyWheels = 'Quantity must be a valid number';
    }

    if (formData.qtyWheels && Number(formData.qtyWheels) <= 0) {
      errors.qtyWheels = 'Quantity must be greater than 0';
    }

    logger.debug('Wheel form validation completed', {
      service: 'WheelOrderService',
      hasErrors: Object.keys(errors).length > 0,
      errorCount: Object.keys(errors).length,
      isAdmin
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
          service: 'WheelOrderService'
        });
        return '';
      }

      const email = await getFirstManagerEmail(store);
      
      logger.debug('Manager email retrieved', {
        service: 'WheelOrderService',
        store,
        hasEmail: !!email
      });

      return email;
    } catch (error) {
      logger.error('Failed to get manager email', {
        service: 'WheelOrderService',
        store,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return '';
    }
  }

  /**
   * Prepare wheel order for submission
   */
  static prepareWheelOrder(formData: WheelFormData): any {
    const orderId = generateUUID();
    
    // Helper function to resolve store color for pallet painting
    const resolveStoreColor = (formData: WheelFormData): string => {
      // Map store names to colors for pallet painting
      const storeColorMap: Record<string, string> = {
        'Fort Worth 022': 'Red',
        'Grand Prairie 027': 'Yellow', 
        'Houston 028': 'Cyan',
        'San Antonio 029': 'Gray',
        'Oklahoma City 030': 'Purple',
        'Little Rock 032': 'Orange',
        'Kansas City 033': 'Pink',
        'Laredo 035': 'Lime',
        'Tulsa 036': 'Green',
        'Austin 039': 'Blue',
        'Detroit 041': 'Mint',
        'Toledo 042': 'Gold',
        'Indianapolis 043': 'Magenta',
        'Tampa 051': 'Olive',
        'Orlando 052': 'Brown',
        'Jacksonville 053': 'Light Green',
        'Grand Prairie 097': 'Green',
        'Romulus 098': 'Hot Pink',
        'Mulberry 099': 'Navy'
      };

      // Try to match store name directly
      if (formData.storeName && storeColorMap[formData.storeName]) {
        return storeColorMap[formData.storeName];
      }

      // Fallback to storeColors if available
      if (formData.storeColors) {
        return String(formData.storeColors);
      }

      return '';
    };
    
    const preparedOrder = {
      id: orderId,
      your_name: formData.yourName,
      store_name: formData.storeName,
      store_id: formData.storeId,
      date_received: formData.dateReceived,
      qty_wheels: parseInt(formData.qtyWheels) || 0,
      customer_name: formData.customerName,
      wheel_material: formData.wheelMaterial,
      wheel_type: formData.wheelType,
      hand_holes: formData.handHoles,
      wheel_size: formData.wheelSize,
      wheel_color: formData.wheelColor,
      schedule_arrival: formData.scheduleArrival,
      user_store: formData.userStore,
      store_color: resolveStoreColor(formData),
      destination_plant: formData.destinationPlant,
      timestamp: formatTimestamp(new Date()),
      order_type: 'WHEEL_POWDER_COATING'
    };

    logger.info('Wheel order prepared for submission', {
      service: 'WheelOrderService',
      orderId,
      store: formData.storeName,
      destinationPlant: formData.destinationPlant,
      quantity: preparedOrder.qty_wheels
    });

    return preparedOrder;
  }

  /**
   * Submit wheel order
   */
  static async submitOrder(formData: WheelFormData, isAdmin?: boolean): Promise<WheelOrderServiceResult> {
    try {
      logger.info('Starting wheel order submission', {
        service: 'WheelOrderService',
        store: formData.storeName,
        destinationPlant: formData.destinationPlant,
        isAdmin
      });

      // Validate form
      const validationErrors = this.validateWheelForm(formData, isAdmin);
      if (Object.keys(validationErrors).length > 0) {
        logger.warn('Wheel form validation failed', {
          service: 'WheelOrderService',
          errors: validationErrors
        });
        return {
          success: false,
          error: 'Validation failed'
        };
      }

      // Prepare order data
      const orderData = this.prepareWheelOrder(formData);

      // Submit to database
      const result = await submitWheelOrder(orderData);

      if (result.success) {
        logger.info('Wheel order submitted successfully', {
          service: 'WheelOrderService',
          orderId: result.data?.id,
          store: formData.storeName,
          destinationPlant: formData.destinationPlant
        });

        return {
          success: true,
          data: result.data
        };
      } else {
        logger.error('Wheel order submission failed', {
          service: 'WheelOrderService',
          error: result.error
        });

        return {
          success: false,
          error: String(result.error) || 'Submission failed'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Wheel order submission error', {
        service: 'WheelOrderService',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create default wheel form data
   */
  static createDefaultFormData(): WheelFormData {
    return {
      yourName: "",
      storeName: "",
      storeId: "",
      dateReceived: new Date().toISOString().split("T")[0],
      qtyWheels: "",
      customerName: "",
      wheelMaterial: "",
      wheelType: "",
      handHoles: "",
      wheelSize: "",
      wheelColor: "",
      scheduleArrival: "",
      userStore: "",
      storeColors: "",
      destinationPlant: ""
    };
  }

  /**
   * Reset form data to defaults
   */
  static resetFormData(): WheelFormData {
    const defaultData = this.createDefaultFormData();
    
    logger.debug('Wheel form data reset', {
      service: 'WheelOrderService'
    });

    return defaultData;
  }

  /**
   * Update store information in form data
   */
  static updateStoreInfo(formData: WheelFormData, storeName: string, storeId: string): WheelFormData {
    const updatedData = {
      ...formData,
      storeName,
      storeId
    };

    logger.debug('Wheel form store info updated', {
      service: 'WheelOrderService',
      storeName,
      storeId
    });

    return updatedData;
  }
}