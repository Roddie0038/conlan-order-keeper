/**
 * Phase 4: Form Validation Service
 * Centralized validation logic for all form types
 */

import { logger } from '@/utils/logger';

export interface ValidationErrors {
  [key: string]: string;
}

export interface RequiredFieldsConfig {
  [fieldName: string]: string; // Field name -> Error message
}

/**
 * Form Validation Service Class
 * Provides reusable validation functions for all order forms
 */
export class FormValidationService {
  /**
   * Validate required fields
   */
  static validateRequiredFields(
    formData: Record<string, any>,
    requiredFields: RequiredFieldsConfig
  ): ValidationErrors {
    const errors: ValidationErrors = {};

    try {
      Object.entries(requiredFields).forEach(([fieldName, errorMessage]) => {
        const value = formData[fieldName];
        
        if (this.isEmpty(value)) {
          errors[fieldName] = errorMessage;
        }
      });

      logger.debug('Required fields validation completed', {
        service: 'FormValidationService',
        fieldsChecked: Object.keys(requiredFields).length,
        errorsFound: Object.keys(errors).length
      });

      return errors;
    } catch (error) {
      logger.error('Error during required fields validation', {
        service: 'FormValidationService',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {};
    }
  }

  /**
   * Check if a value is empty/invalid
   */
  private static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): string | null {
    try {
      if (!email || typeof email !== 'string') {
        return 'Email is required';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
      }

      logger.debug('Email validation passed', {
        service: 'FormValidationService',
        email: email.substring(0, 3) + '***' // Log partial for privacy
      });

      return null;
    } catch (error) {
      logger.error('Error validating email', {
        service: 'FormValidationService',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 'Email validation failed';
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): string | null {
    try {
      if (!phone || typeof phone !== 'string') {
        return 'Phone number is required';
      }

      // Remove all non-digit characters
      const digitsOnly = phone.replace(/\D/g, '');

      // Check for valid US phone number length
      if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
        return 'Please enter a valid phone number';
      }

      // If 11 digits, should start with 1
      if (digitsOnly.length === 11 && !digitsOnly.startsWith('1')) {
        return 'Please enter a valid US phone number';
      }

      logger.debug('Phone number validation passed', {
        service: 'FormValidationService',
        phoneLength: digitsOnly.length
      });

      return null;
    } catch (error) {
      logger.error('Error validating phone number', {
        service: 'FormValidationService',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 'Phone number validation failed';
    }
  }

  /**
   * Validate numeric value
   */
  static validateNumeric(value: string, fieldName: string = 'Field'): string | null {
    try {
      if (!value || typeof value !== 'string') {
        return `${fieldName} is required`;
      }

      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        return `${fieldName} must be a valid number`;
      }

      if (numericValue < 0) {
        return `${fieldName} must be a positive number`;
      }

      logger.debug('Numeric validation passed', {
        service: 'FormValidationService',
        fieldName,
        value: numericValue
      });

      return null;
    } catch (error) {
      logger.error('Error validating numeric value', {
        service: 'FormValidationService',
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return `${fieldName} validation failed`;
    }
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string, fieldName: string = 'Date'): string | null {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return `${fieldName} is required`;
      }

      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return `${fieldName} must be a valid date`;
      }

      // Check if date is not too far in the past or future
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      if (parsedDate < oneYearAgo || parsedDate > oneYearFromNow) {
        return `${fieldName} must be within a reasonable date range`;
      }

      logger.debug('Date validation passed', {
        service: 'FormValidationService',
        fieldName,
        date: parsedDate.toISOString()
      });

      return null;
    } catch (error) {
      logger.error('Error validating date', {
        service: 'FormValidationService',
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return `${fieldName} validation failed`;
    }
  }

  /**
   * Validate file upload
   */
  static validateFile(
    file: File | null,
    fieldName: string = 'File',
    options: {
      required?: boolean;
      maxSizeBytes?: number;
      allowedTypes?: string[];
    } = {}
  ): string | null {
    try {
      const { required = true, maxSizeBytes = 10 * 1024 * 1024, allowedTypes = [] } = options;

      if (!file) {
        return required ? `${fieldName} is required` : null;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return `${fieldName} must be smaller than ${maxSizeMB}MB`;
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `${fieldName} must be one of the following types: ${allowedTypes.join(', ')}`;
      }

      logger.debug('File validation passed', {
        service: 'FormValidationService',
        fieldName,
        fileSize: file.size,
        fileType: file.type
      });

      return null;
    } catch (error) {
      logger.error('Error validating file', {
        service: 'FormValidationService',
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return `${fieldName} validation failed`;
    }
  }

  /**
   * Validate array of files
   */
  static validateFiles(
    files: File[],
    fieldName: string = 'Files',
    options: {
      required?: boolean;
      minCount?: number;
      maxCount?: number;
      maxSizeBytes?: number;
      allowedTypes?: string[];
    } = {}
  ): string | null {
    try {
      const { 
        required = true, 
        minCount = 1, 
        maxCount = 10, 
        maxSizeBytes = 10 * 1024 * 1024, 
        allowedTypes = [] 
      } = options;

      if (!files || files.length === 0) {
        return required ? `${fieldName} are required` : null;
      }

      if (files.length < minCount) {
        return `At least ${minCount} ${fieldName.toLowerCase()} ${minCount === 1 ? 'is' : 'are'} required`;
      }

      if (files.length > maxCount) {
        return `Maximum ${maxCount} ${fieldName.toLowerCase()} allowed`;
      }

      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const fileError = this.validateFile(files[i], `${fieldName} ${i + 1}`, {
          required: true,
          maxSizeBytes,
          allowedTypes
        });
        
        if (fileError) {
          return fileError;
        }
      }

      logger.debug('Files validation passed', {
        service: 'FormValidationService',
        fieldName,
        fileCount: files.length
      });

      return null;
    } catch (error) {
      logger.error('Error validating files', {
        service: 'FormValidationService',
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return `${fieldName} validation failed`;
    }
  }
}

// Export helper function for backward compatibility
export const validateRequiredFields = FormValidationService.validateRequiredFields;