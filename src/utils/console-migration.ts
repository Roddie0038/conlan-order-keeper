/**
 * Phase 4: Console Migration Utility
 * Helper script to identify and replace console statements with logger
 * This file contains utilities for the migration process
 */

import { logger } from '@/utils/logger';

/**
 * Migration helper functions to replace console statements
 * These functions help during the transition period
 */

export const consoleToLogger = {
  log: (message: string, data?: any) => {
    logger.info(message, { ...data, migrated: true });
  },
  
  warn: (message: string, data?: any) => {
    logger.warn(message, { ...data, migrated: true });
  },
  
  error: (message: string, data?: any) => {
    logger.error(message, { ...data, migrated: true });
  },
  
  debug: (message: string, data?: any) => {
    logger.debug(message, { ...data, migrated: true });
  }
};