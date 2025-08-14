/**
 * Phase 4: Order Form Service
 * Centralized business logic for order form processing
 */

import { logger } from '@/utils/logger';
import { saveOrderToSupabase } from '@/services/orderService';
import { submitToGoogleSheets } from '@/services/sheets';
import { sendTransferOrderConfirmation } from '@/services/NotificationController';
import { extractStoreNumber, normalizeStoreFormat } from '@/utils/normalization/StoreNormalizationUtils';
import { getPlantForStore } from '@/utils/plantMapping';
import { generateUUID } from '@/utils/uuid/UUIDUtils';
import { formatTimestamp } from '@/utils/formatting/DateTimeUtils';
import { validateRequiredFields } from '@/services/formService/FormValidationService';
import { SHOW_CROSS_DOCK } from '@/config/featureFlags';
import type { OrderFormData } from '@/types/orders';

export interface OrderSummary {
  id: string;
  yourName: string;
  store: string;
  productNumber: string;
  description: string;
  quantity: string | number;
  scheduleArrival: string;
  notes: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  destinationPlant: string;
  selected: boolean;
  timestamp: string;
  qtyWheels?: string | number;
  casingGrade?: string | string[];
  type?: string;
}

export interface OrderFormServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface OrderValidationErrors {
  [key: string]: string;
}

/**
 * Order Form Service Class
 * Handles all order form business logic
 */
export class OrderFormService {
  /**
   * Validate order form data
   */
  static validateOrderForm(formData: any): OrderValidationErrors {
    const errors: OrderValidationErrors = {};

    // Required field validation
    const requiredFields = {
      yourName: 'Name is required',
      store: 'Store is required',
      productNumber: 'Product number is required',
      description: 'Description is required',
      quantity: 'Quantity is required',
      scheduleArrival: 'Schedule arrival is required',
      destinationPlant: 'Destination plant is required'
    };

    const fieldErrors = validateRequiredFields(formData, requiredFields);
    Object.assign(errors, fieldErrors);

    // Quantity validation
    if (formData.quantity && isNaN(Number(formData.quantity))) {
      errors.quantity = 'Quantity must be a valid number';
    }

    if (formData.quantity && Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    // Cross dock validation
    if (SHOW_CROSS_DOCK && formData.crossDock === "Yes" && !formData.crossDockDestination) {
      errors.crossDockDestination = 'Cross dock destination is required when cross dock is enabled';
    }

    logger.debug('Order form validation completed', {
      service: 'OrderFormService',
      hasErrors: Object.keys(errors).length > 0,
      errorCount: Object.keys(errors).length
    });

    return errors;
  }

  /**
   * Create order summary from form data
   */
  static createOrderSummary(formData: any): OrderSummary {
    const orderId = generateUUID();
    
    const summary: OrderSummary = {
      id: orderId,
      yourName: formData.yourName || '',
      store: normalizeStoreFormat(formData.store),
      productNumber: formData.productNumber || '',
      description: formData.description || '',
      quantity: formData.quantity || 0,
      scheduleArrival: formData.scheduleArrival || '',
      notes: formData.notes || '',
      crossDock: SHOW_CROSS_DOCK ? (formData.crossDock || "No") : "No",
      crossDockDestination: SHOW_CROSS_DOCK ? (formData.crossDockDestination || '') : '',
      destinationPlant: formData.destinationPlant || '',
      selected: true,
      timestamp: formatTimestamp(new Date())
    };

    logger.info('Order summary created', {
      service: 'OrderFormService',
      orderId,
      store: summary.store,
      destinationPlant: summary.destinationPlant,
      quantity: summary.quantity
    });

    return summary;
  }

  /**
   * Determine order type based on order properties
   */
  static determineOrderType(order: OrderSummary): string {
    // Check if it's a wheel order
    if ('qtyWheels' in order && order.qtyWheels) {
      return "WHEEL_POWDER_COATING";
    }
    // Check if it's explicitly marked as MTO
    else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
      return "MTO";
    }
    
    // Default to TRANSFER
    return "TRANSFER";
  }

  /**
   * Prepare order for submission
   */
  static prepareOrderForSubmission(order: OrderSummary, user: any): OrderFormData {
    const storeNumber = extractStoreNumber(order.store);
    const plant = getPlantForStore(order.store);
    const orderType = this.determineOrderType(order);

    const orderRecord: OrderFormData = {
      name: order.yourName,
      store: order.store,
      productNumber: order.productNumber,
      description: order.description,
      quantity: parseInt(order.quantity.toString()) || 0,
      scheduleArrival: order.scheduleArrival,
      notes: order.notes,
      crossDock: order.crossDock || "No",
      crossDockDestination: order.crossDockDestination || "",
      email: user?.email || "",
      plant: plant,
      timestamp: order.timestamp,
      type: orderType as any
    };

    logger.info('Order prepared for submission', {
      service: 'OrderFormService',
      orderId: order.id,
      orderType,
      store: order.store,
      storeNumber,
      plant
    });

    return orderRecord;
  }

  /**
   * Submit multiple orders
   */
  static async submitOrders(
    selectedOrders: OrderSummary[],
    user: any
  ): Promise<OrderFormServiceResult> {
    if (selectedOrders.length === 0) {
      return {
        success: false,
        error: 'No orders selected for submission'
      };
    }

    logger.info('Starting order submission', {
      service: 'OrderFormService',
      orderCount: selectedOrders.length,
      userEmail: user?.email
    });

    try {
      // Process each order with validation
      for (const order of selectedOrders) {
        // Validate and normalize destination store
        if (!/^(?:[A-Za-z]+(?:\s[A-Za-z]+)*)\s0\d{2}$/.test(order.store || '')) {
          throw new Error('Destination store must be normalized as "City 0XX".');
        }
        if ((order.store || '').toLowerCase().startsWith('unassigned')) {
          throw new Error('Destination store cannot be "Unassigned". Pick a real store.');
        }

        const orderRecord = this.prepareOrderForSubmission(order, user);
        
        // Email validation and fallback
        if (orderRecord.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
          const companyRegex = /@conlantire\.com$/i;
          if (!emailRegex.test(orderRecord.email)) {
            throw new Error('Enter a valid email address.');
          }
          if (!companyRegex.test(orderRecord.email)) {
            throw new Error('Email must use company domain (@conlantire.com).');
          }
        } else {
          // Fallback must be the authenticated user's email to satisfy RLS
          orderRecord.email = (user?.email || '').trim().toLowerCase();
          if (!orderRecord.email) {
            throw new Error('No authenticated email found for submission.');
          }
        }

        const storeNumber = extractStoreNumber(order.store);

        logger.debug('Processing order', {
          service: 'OrderFormService',
          orderId: order.id,
          orderType: orderRecord.type,
          store: order.store,
          storeNumber
        });

        // Submit to Supabase
        const savedOrderResult = await saveOrderToSupabase(orderRecord, user);
        
        // Submit to Google Sheets
        await submitToGoogleSheets(orderRecord, user);

        // Send confirmation email
        if (storeNumber && savedOrderResult?.data?.id) {
          try {
            const emailResult = await sendTransferOrderConfirmation(
              {
                store: order.store,
                plant: orderRecord.plant,
                email: orderRecord.email,
                name: orderRecord.name
              },
              savedOrderResult.data.id.toString(),
              {
                quantity: orderRecord.quantity,
                product_number: orderRecord.productNumber,
                description: orderRecord.description
              }
            );
            
            if (emailResult.success) {
              logger.info('Store confirmation email sent successfully', {
                service: 'OrderFormService',
                orderId: order.id,
                storeNumber
              });
            } else {
              logger.warn('Store confirmation email failed', {
                service: 'OrderFormService',
                orderId: order.id,
                error: emailResult.message
              });
            }
          } catch (emailError) {
            logger.error('Error sending store confirmation email', {
              service: 'OrderFormService',
              orderId: order.id,
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
            });
            // Don't block order submission for email failures
          }
        }
      }

      logger.info('Order submission completed successfully', {
        service: 'OrderFormService',
        orderCount: selectedOrders.length
      });

      return {
        success: true,
        data: { submittedCount: selectedOrders.length }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Order submission failed', {
        service: 'OrderFormService',
        error: errorMessage,
        orderCount: selectedOrders.length
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create default form data
   */
  static createDefaultFormData(userStore?: string): any {
    return {
      yourName: "",
      store: userStore || "",
      dateReceived: new Date().toISOString(),
      productNumber: "",
      description: "",
      quantity: "",
      scheduleArrival: "",
      notes: "",
      crossDock: "No" as "Yes" | "No",
      crossDockDestination: "",
      receiverNo: "",
      etaDate: "",
      crossDockConfirmation: false,
      managersEmail: "",
      destinationPlant: "",
    };
  }

  /**
   * Reset form data to defaults
   */
  static resetFormData(userStore?: string, isAdmin?: boolean): any {
    const defaultData = this.createDefaultFormData(userStore);
    
    // For non-admin users, preserve their store
    if (!isAdmin && userStore) {
      defaultData.store = userStore;
    }

    logger.debug('Order form data reset', {
      service: 'OrderFormService',
      userStore,
      isAdmin
    });

    return defaultData;
  }
}