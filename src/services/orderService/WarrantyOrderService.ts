/**
 * Phase 4: Warranty Order Service
 * Centralized business logic for warranty order processing
 */

import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { validateRequiredFields } from '@/services/formService/FormValidationService';
import { generateUUID } from '@/utils/uuid/UUIDUtils';
import { formatTimestamp } from '@/utils/formatting/DateTimeUtils';
import { RetreadWarrantyFormData } from '@/hooks/useRetreadWarrantyForm';

export interface WarrantyOrderServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface WarrantyValidationErrors {
  [key: string]: string;
}

/**
 * Warranty Order Service Class
 * Handles all warranty order business logic
 */
export class WarrantyOrderService {
  /**
   * Validate warranty form data
   */
  static validateWarrantyForm(formData: RetreadWarrantyFormData): WarrantyValidationErrors {
    const errors: WarrantyValidationErrors = {};

    // Required field validation
    const requiredFields = {
      dotNumber: 'DOT Number is required',
      condition: 'Condition is required', 
      customerName: 'Customer name is required',
      workOrder: 'Work order is required',
      tireSize: 'Tire size is required',
      destinationPlant: 'Destination plant is required'
    };

    const fieldErrors = validateRequiredFields(formData, requiredFields);
    Object.assign(errors, fieldErrors);

    // Warranty-specific validations
    if (!formData.acknowledged) {
      errors.acknowledged = 'You must acknowledge the terms and conditions';
    }

    if (!formData.invoiceFile) {
      errors.invoiceFile = 'Invoice file is required';
    }

    if (!formData.photoFiles || formData.photoFiles.length === 0) {
      errors.photoFiles = 'At least one photo is required';
    }

    // DOT number format validation
    if (formData.dotNumber && !/^[A-Z0-9]{10,12}$/.test(formData.dotNumber.toUpperCase())) {
      errors.dotNumber = 'DOT Number must be 10-12 alphanumeric characters';
    }

    logger.debug('Warranty form validation completed', {
      service: 'WarrantyOrderService',
      hasErrors: Object.keys(errors).length > 0,
      errorCount: Object.keys(errors).length
    });

    return errors;
  }

  /**
   * Upload warranty files to storage
   */
  static async uploadWarrantyFiles(
    orderId: string,
    invoiceFile: File,
    photoFiles: File[]
  ): Promise<{ invoiceUrl?: string; photoUrls: string[]; error?: string }> {
    try {
      const uploadResults = { photoUrls: [] as string[] };

      // Upload invoice file
      if (invoiceFile) {
        const invoiceFileName = `warranty-${orderId}-invoice-${Date.now()}-${invoiceFile.name}`;
        const { data: invoiceData, error: invoiceError } = await supabase.storage
          .from('warranty-documents')
          .upload(invoiceFileName, invoiceFile);

        if (invoiceError) {
          logger.error('Failed to upload invoice file', {
            service: 'WarrantyOrderService',
            orderId,
            error: invoiceError.message
          });
          return { photoUrls: [], error: 'Failed to upload invoice file' };
        }

        (uploadResults as any).invoiceUrl = invoiceData.path;
      }

      // Upload photo files
      for (const [index, photoFile] of photoFiles.entries()) {
        const photoFileName = `warranty-${orderId}-photo-${index + 1}-${Date.now()}-${photoFile.name}`;
        const { data: photoData, error: photoError } = await supabase.storage
          .from('warranty-documents')
          .upload(photoFileName, photoFile);

        if (photoError) {
          logger.error('Failed to upload photo file', {
            service: 'WarrantyOrderService',
            orderId,
            photoIndex: index,
            error: photoError.message
          });
          return { photoUrls: [], error: `Failed to upload photo ${index + 1}` };
        }

        uploadResults.photoUrls.push(photoData.path);
      }

      logger.info('Warranty files uploaded successfully', {
        service: 'WarrantyOrderService',
        orderId,
        invoiceUploaded: !!(uploadResults as any).invoiceUrl,
        photoCount: uploadResults.photoUrls.length
      });

      return uploadResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Warranty file upload error', {
        service: 'WarrantyOrderService',
        orderId,
        error: errorMessage
      });
      return { photoUrls: [], error: errorMessage };
    }
  }

  /**
   * Prepare warranty order for submission
   */
  static prepareWarrantyOrder(
    formData: RetreadWarrantyFormData,
    fileUrls: { invoiceUrl?: string; photoUrls: string[] }
  ): any {
    const orderId = generateUUID();
    
    const preparedOrder = {
      id: orderId,
      dot_number: formData.dotNumber.toUpperCase(),
      condition: formData.condition,
      notes: formData.notes,
      customer_name: formData.customerName,
      work_order: formData.workOrder,
      tire_size: formData.tireSize,
      invoice_file_url: fileUrls.invoiceUrl,
      photo_file_urls: fileUrls.photoUrls,
      destination_plant: formData.destinationPlant,
      acknowledged: formData.acknowledged,
      timestamp: formatTimestamp(new Date()),
      order_type: 'WARRANTY'
    };

    logger.info('Warranty order prepared for submission', {
      service: 'WarrantyOrderService',
      orderId,
      dotNumber: formData.dotNumber,
      destinationPlant: formData.destinationPlant,
      hasInvoice: !!fileUrls.invoiceUrl,
      photoCount: fileUrls.photoUrls.length
    });

    return preparedOrder;
  }

  /**
   * Submit warranty order
   */
  static async submitOrder(formData: RetreadWarrantyFormData): Promise<WarrantyOrderServiceResult> {
    try {
      logger.info('Starting warranty order submission', {
        service: 'WarrantyOrderService',
        dotNumber: formData.dotNumber,
        destinationPlant: formData.destinationPlant
      });

      // Validate form
      const validationErrors = this.validateWarrantyForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        logger.warn('Warranty form validation failed', {
          service: 'WarrantyOrderService',
          errors: validationErrors
        });
        return {
          success: false,
          error: 'Validation failed'
        };
      }

      const orderId = generateUUID();

      // Upload files
      const fileUploadResult = await this.uploadWarrantyFiles(
        orderId,
        formData.invoiceFile!,
        formData.photoFiles
      );

      if (fileUploadResult.error) {
        return {
          success: false,
          error: fileUploadResult.error
        };
      }

      // Prepare order data
      const orderData = this.prepareWarrantyOrder(formData, fileUploadResult);

      // Submit to database
      const { data, error } = await supabase
        .from('warranty_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        logger.error('Warranty order database submission failed', {
          service: 'WarrantyOrderService',
          orderId,
          error: error.message
        });

        return {
          success: false,
          error: error.message
        };
      }

      logger.info('Warranty order submitted successfully', {
        service: 'WarrantyOrderService',
        orderId: data.id,
        dotNumber: formData.dotNumber,
        destinationPlant: formData.destinationPlant
      });

      return {
        success: true,
        data
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Warranty order submission error', {
        service: 'WarrantyOrderService',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create default warranty form data
   */
  static createDefaultFormData(): RetreadWarrantyFormData {
    return {
      dotNumber: "",
      condition: "",
      notes: "",
      customerName: "",
      workOrder: "",
      tireSize: "",
      invoiceFile: null,
      photoFiles: [],
      acknowledged: false,
      destinationPlant: ""
    };
  }

  /**
   * Reset form data to defaults
   */
  static resetFormData(): RetreadWarrantyFormData {
    const defaultData = this.createDefaultFormData();
    
    logger.debug('Warranty form data reset', {
      service: 'WarrantyOrderService'
    });

    return defaultData;
  }
}