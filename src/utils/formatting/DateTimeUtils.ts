/**
 * Phase 4: Date/Time Formatting Utilities
 * Standardized date and time formatting across the platform
 */

import { logger } from '@/utils/logger';

/**
 * Format timestamp to standardized format (MM/DD/YYYY HH:MM AM/PM)
 */
export function formatTimestamp(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date provided to formatTimestamp', {
        service: 'DateTimeUtils',
        providedDate: date
      });
      return new Date().toLocaleString();
    }

    const formatted = dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    logger.debug('Timestamp formatted', {
      service: 'DateTimeUtils',
      originalDate: date,
      formattedDate: formatted
    });

    return formatted;
  } catch (error) {
    logger.error('Error formatting timestamp', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error',
      providedDate: date
    });
    return new Date().toLocaleString();
  }
}

/**
 * Format date to standardized format (MM/DD/YYYY)
 */
export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date provided to formatDate', {
        service: 'DateTimeUtils',
        providedDate: date
      });
      return new Date().toLocaleDateString();
    }

    const formatted = dateObj.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    logger.debug('Date formatted', {
      service: 'DateTimeUtils',
      originalDate: date,
      formattedDate: formatted
    });

    return formatted;
  } catch (error) {
    logger.error('Error formatting date', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error',
      providedDate: date
    });
    return new Date().toLocaleDateString();
  }
}

/**
 * Format time to standardized format (HH:MM AM/PM)
 */
export function formatTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date provided to formatTime', {
        service: 'DateTimeUtils',
        providedDate: date
      });
      return new Date().toLocaleTimeString();
    }

    const formatted = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    logger.debug('Time formatted', {
      service: 'DateTimeUtils',
      originalDate: date,
      formattedTime: formatted
    });

    return formatted;
  } catch (error) {
    logger.error('Error formatting time', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error',
      providedDate: date
    });
    return new Date().toLocaleTimeString();
  }
}

/**
 * Get current date/time in ISO format
 */
export function getCurrentISODateTime(): string {
  try {
    const iso = new Date().toISOString();
    logger.debug('Current ISO date/time generated', {
      service: 'DateTimeUtils',
      isoDateTime: iso
    });
    return iso;
  } catch (error) {
    logger.error('Error generating current ISO date/time', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return new Date().toISOString();
  }
}

/**
 * Parse date string to Date object with validation
 */
export function parseDate(dateString: string): Date | null {
  try {
    if (!dateString || typeof dateString !== 'string') {
      logger.warn('Invalid date string provided to parseDate', {
        service: 'DateTimeUtils',
        providedString: dateString
      });
      return null;
    }

    const parsedDate = new Date(dateString);
    
    if (isNaN(parsedDate.getTime())) {
      logger.warn('Failed to parse date string', {
        service: 'DateTimeUtils',
        providedString: dateString
      });
      return null;
    }

    logger.debug('Date string parsed successfully', {
      service: 'DateTimeUtils',
      originalString: dateString,
      parsedDate: parsedDate.toISOString()
    });

    return parsedDate;
  } catch (error) {
    logger.error('Error parsing date string', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error',
      providedString: dateString
    });
    return null;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date provided to getRelativeTime', {
        service: 'DateTimeUtils',
        providedDate: date
      });
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relativeTime: string;

    if (diffMins < 1) {
      relativeTime = 'Just now';
    } else if (diffMins < 60) {
      relativeTime = `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      relativeTime = formatDate(dateObj);
    }

    logger.debug('Relative time calculated', {
      service: 'DateTimeUtils',
      originalDate: date,
      relativeTime: relativeTime
    });

    return relativeTime;
  } catch (error) {
    logger.error('Error calculating relative time', {
      service: 'DateTimeUtils',
      error: error instanceof Error ? error.message : 'Unknown error',
      providedDate: date
    });
    return 'Unknown';
  }
}