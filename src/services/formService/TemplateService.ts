/**
 * Phase 4: Template Service
 * Centralized template management for all order forms
 */

import { logger } from '@/utils/logger';

export interface TemplateServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type OrderType = 'regular' | 'mto' | 'wheel' | 'warranty';

/**
 * Template Service Class
 * Handles template loading and management for all order types
 */
export class TemplateService {
  /**
   * Load template data into form
   */
  static loadTemplate(
    templateData: any,
    orderType: OrderType,
    userStore?: string,
    isAdmin?: boolean
  ): any {
    try {
      logger.info('Loading template', {
        service: 'TemplateService',
        orderType,
        hasUserStore: !!userStore,
        isAdmin
      });

      // Base template processing
      let processedTemplate = { ...templateData };

      // Order type specific processing
      switch (orderType) {
        case 'regular':
          processedTemplate = this.processRegularOrderTemplate(processedTemplate, userStore, isAdmin);
          break;
        case 'mto':
          processedTemplate = this.processMTOTemplate(processedTemplate, userStore, isAdmin);
          break;
        case 'wheel':
          processedTemplate = this.processWheelTemplate(processedTemplate, userStore, isAdmin);
          break;
        case 'warranty':
          processedTemplate = this.processWarrantyTemplate(processedTemplate);
          break;
        default:
          logger.warn('Unknown order type for template loading', {
            service: 'TemplateService',
            orderType
          });
      }

      // Common processing for all templates
      processedTemplate = this.applyCommonTemplateProcessing(processedTemplate, isAdmin);

      logger.debug('Template loaded successfully', {
        service: 'TemplateService',
        orderType,
        fieldsCount: Object.keys(processedTemplate).length
      });

      return processedTemplate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Template loading failed', {
        service: 'TemplateService',
        orderType,
        error: errorMessage
      });

      throw new Error(`Failed to load template: ${errorMessage}`);
    }
  }

  /**
   * Process regular order template
   */
  private static processRegularOrderTemplate(
    templateData: any,
    userStore?: string,
    isAdmin?: boolean
  ): any {
    const processed = { ...templateData };

    // For non-admin users, preserve their store
    if (!isAdmin && userStore) {
      processed.store = userStore;
      processed.managersEmail = ""; // Clear manager email to be re-fetched
    }

    // Reset dynamic fields
    processed.destinationPlant = "";
    processed.dateReceived = new Date().toISOString();

    return processed;
  }

  /**
   * Process MTO template
   */
  private static processMTOTemplate(
    templateData: any,
    userStore?: string,
    isAdmin?: boolean
  ): any {
    const processed = { ...templateData };

    // For non-admin users, preserve their store
    if (!isAdmin && userStore) {
      processed.store = userStore;
    }

    // Reset dynamic fields
    processed.destinationPlant = "";
    processed.timestamp = new Date().toLocaleString();
    processed.managerEmail = "";

    return processed;
  }

  /**
   * Process wheel template
   */
  private static processWheelTemplate(
    templateData: any,
    userStore?: string,
    isAdmin?: boolean
  ): any {
    const processed = { ...templateData };

    // For non-admin users, preserve their store
    if (!isAdmin && userStore) {
      processed.storeName = userStore;
      // Clear store ID to be re-fetched based on store name
      processed.storeId = "";
    }

    // Reset dynamic fields
    processed.destinationPlant = "";
    processed.dateReceived = new Date().toISOString().split("T")[0];

    return processed;
  }

  /**
   * Process warranty template
   */
  private static processWarrantyTemplate(templateData: any): any {
    const processed = { ...templateData };

    // Reset dynamic fields
    processed.destinationPlant = "";
    processed.invoiceFile = null;
    processed.photoFiles = [];
    processed.acknowledged = false;

    return processed;
  }

  /**
   * Apply common template processing
   */
  private static applyCommonTemplateProcessing(templateData: any, isAdmin?: boolean): any {
    const processed = { ...templateData };

    // Remove any ID fields from templates
    delete processed.id;
    delete processed.order_id;

    // Reset submission state
    processed.isSubmitting = false;

    logger.debug('Common template processing applied', {
      service: 'TemplateService',
      isAdmin,
      fieldsProcessed: Object.keys(processed).length
    });

    return processed;
  }

  /**
   * Validate template data for order type
   */
  static validateTemplate(templateData: any, orderType: OrderType): TemplateServiceResult {
    try {
      if (!templateData || typeof templateData !== 'object') {
        return {
          success: false,
          error: 'Invalid template data format'
        };
      }

      // Order type specific validation
      let isValid = true;
      let validationError = '';

      switch (orderType) {
        case 'regular':
          isValid = this.validateRegularOrderTemplate(templateData);
          break;
        case 'mto':
          isValid = this.validateMTOTemplate(templateData);
          break;
        case 'wheel':
          isValid = this.validateWheelTemplate(templateData);
          break;
        case 'warranty':
          isValid = this.validateWarrantyTemplate(templateData);
          break;
        default:
          isValid = false;
          validationError = `Unsupported order type: ${orderType}`;
      }

      if (!isValid && !validationError) {
        validationError = `Invalid template data for ${orderType} order`;
      }

      logger.debug('Template validation completed', {
        service: 'TemplateService',
        orderType,
        isValid
      });

      return {
        success: isValid,
        data: isValid ? templateData : undefined,
        error: isValid ? undefined : validationError
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Template validation error', {
        service: 'TemplateService',
        orderType,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate regular order template
   */
  private static validateRegularOrderTemplate(templateData: any): boolean {
    const requiredFields = ['productNumber', 'description', 'quantity'];
    return requiredFields.every(field => field in templateData);
  }

  /**
   * Validate MTO template
   */
  private static validateMTOTemplate(templateData: any): boolean {
    const requiredFields = ['productNumber', 'quantity'];
    return requiredFields.every(field => field in templateData);
  }

  /**
   * Validate wheel template
   */
  private static validateWheelTemplate(templateData: any): boolean {
    const requiredFields = ['qtyWheels', 'wheelMaterial', 'wheelType'];
    return requiredFields.every(field => field in templateData);
  }

  /**
   * Validate warranty template
   */
  private static validateWarrantyTemplate(templateData: any): boolean {
    const requiredFields = ['dotNumber', 'condition', 'customerName'];
    return requiredFields.every(field => field in templateData);
  }
}