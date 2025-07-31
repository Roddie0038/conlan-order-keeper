/**
 * Phase 3: Standardized Error Handling Utility
 * Provides consistent error handling patterns across the application
 * Follows OT Platform error handling standards
 */

import { logger } from './logger';

export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  NETWORK = 'network',
  DATABASE = 'database',
  EMAIL = 'email',
  FILE_UPLOAD = 'file_upload',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown'
}

export interface StandardError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  userMessage?: string;
  isRetryable?: boolean;
  context?: Record<string, any>;
  originalError?: Error;
}

export interface ErrorResult<T = any> {
  success: false;
  error: StandardError;
  data?: never;
}

export interface SuccessResult<T = any> {
  success: true;
  data: T;
  error?: never;
}

export type Result<T = any> = SuccessResult<T> | ErrorResult<T>;

class ErrorHandler {
  /**
   * Create a standardized error
   */
  createError(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      details?: Record<string, any>;
      userMessage?: string;
      isRetryable?: boolean;
      context?: Record<string, any>;
      originalError?: Error;
    } = {}
  ): StandardError {
    return {
      type,
      message,
      code: options.code,
      details: options.details,
      userMessage: options.userMessage || this.getDefaultUserMessage(type),
      isRetryable: options.isRetryable ?? this.getDefaultRetryable(type),
      context: options.context,
      originalError: options.originalError
    };
  }

  /**
   * Handle and log an error, returning a standardized error result
   */
  handleError(
    error: Error | StandardError | unknown,
    context?: Record<string, any>
  ): ErrorResult {
    let standardError: StandardError;

    if (this.isStandardError(error)) {
      standardError = error;
    } else if (error instanceof Error) {
      standardError = this.fromError(error, context);
    } else {
      standardError = this.createError(
        ErrorType.UNKNOWN,
        'An unknown error occurred',
        {
          details: { originalError: String(error) },
          context
        }
      );
    }

    // Log the error
    logger.error(standardError.message, {
      errorType: standardError.type,
      errorCode: standardError.code,
      isRetryable: standardError.isRetryable,
      ...standardError.context,
      ...context
    }, standardError.originalError);

    return {
      success: false,
      error: standardError
    };
  }

  /**
   * Convert a regular Error to StandardError
   */
  fromError(error: Error, context?: Record<string, any>): StandardError {
    const type = this.inferErrorType(error);
    
    return this.createError(
      type,
      error.message,
      {
        context,
        originalError: error
      }
    );
  }

  /**
   * Create a success result
   */
  success<T>(data: T): SuccessResult<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Wrap an async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<Result<T>> {
    try {
      const data = await fn();
      return this.success(data);
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  /**
   * Check if an object is a StandardError
   */
  private isStandardError(obj: any): obj is StandardError {
    return obj && typeof obj === 'object' && 'type' in obj && 'message' in obj;
  }

  /**
   * Infer error type from Error object
   */
  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION;
    }
    if (name.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('not found') || name.includes('notfound')) {
      return ErrorType.NOT_FOUND;
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('database') || message.includes('sql') || message.includes('constraint')) {
      return ErrorType.DATABASE;
    }
    if (message.includes('email') || message.includes('smtp') || message.includes('resend')) {
      return ErrorType.EMAIL;
    }
    if (message.includes('upload') || message.includes('file') || message.includes('storage')) {
      return ErrorType.FILE_UPLOAD;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Get default user-friendly message for error type
   */
  private getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please log in and try again.';
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource could not be found.';
      case ErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case ErrorType.DATABASE:
        return 'Database error. Please try again later.';
      case ErrorType.EMAIL:
        return 'Email could not be sent. Please try again later.';
      case ErrorType.FILE_UPLOAD:
        return 'File upload failed. Please try again.';
      case ErrorType.BUSINESS_LOGIC:
        return 'Operation could not be completed. Please check your input.';
      case ErrorType.EXTERNAL_SERVICE:
        return 'External service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Determine if error type is retryable by default
   */
  private getDefaultRetryable(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK:
      case ErrorType.DATABASE:
      case ErrorType.EMAIL:
      case ErrorType.EXTERNAL_SERVICE:
        return true;
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.NOT_FOUND:
      case ErrorType.FILE_UPLOAD:
      case ErrorType.BUSINESS_LOGIC:
        return false;
      default:
        return false;
    }
  }
}

// Export singleton error handler
export const errorHandler = new ErrorHandler();

// Convenience functions
export const createError = errorHandler.createError.bind(errorHandler);
export const handleError = errorHandler.handleError.bind(errorHandler);
export const withErrorHandling = errorHandler.withErrorHandling.bind(errorHandler);
export const successResult = errorHandler.success.bind(errorHandler);