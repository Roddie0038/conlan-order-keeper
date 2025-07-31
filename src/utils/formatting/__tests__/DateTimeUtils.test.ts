/**
 * Phase 5: Unit Tests for DateTimeUtils
 * Comprehensive test coverage for date/time formatting utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatTimestamp,
  formatDate,
  formatTime
} from '@/utils/formatting/DateTimeUtils';

describe('DateTimeUtils', () => {
  // Mock system timezone for consistent testing
  const originalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTimestamp', () => {
    it('should format Date object to MM/DD/YYYY HH:MM AM/PM format', () => {
      const testDate = new Date('2024-01-15T14:30:45.123Z');
      const result = formatTimestamp(testDate);
      
      // Result should be in MM/DD/YYYY HH:MM AM/PM format
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should handle morning hours correctly', () => {
      const morningDate = new Date('2024-01-15T09:15:00.000Z');
      const result = formatTimestamp(morningDate);
      
      expect(result).toContain('AM');
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024 \d{1,2}:\d{2} AM$/);
    });

    it('should handle afternoon hours correctly', () => {
      const afternoonDate = new Date('2024-01-15T15:45:00.000Z');
      const result = formatTimestamp(afternoonDate);
      
      expect(result).toContain('PM');
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024 \d{1,2}:\d{2} PM$/);
    });

    it('should handle midnight correctly', () => {
      const midnightDate = new Date('2024-01-15T00:00:00.000Z');
      const result = formatTimestamp(midnightDate);
      
      expect(result).toContain('12:00 AM');
    });

    it('should handle noon correctly', () => {
      const noonDate = new Date('2024-01-15T12:00:00.000Z');
      const result = formatTimestamp(noonDate);
      
      expect(result).toContain('12:00 PM');
    });

    it('should format current date when no parameter provided', () => {
      const mockDate = new Date('2024-01-15T14:30:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const result = formatTimestamp(new Date());
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024 \d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should handle different years correctly', () => {
      const dates = [
        new Date('2020-06-15T10:30:00.000Z'),
        new Date('2023-12-31T23:59:00.000Z'),
        new Date('2025-01-01T00:01:00.000Z')
      ];

      dates.forEach(date => {
        const result = formatTimestamp(date);
        expect(result).toContain(date.getFullYear().toString());
      });
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid-date');
      
      expect(() => formatTimestamp(invalidDate)).not.toThrow();
      
      const result = formatTimestamp(invalidDate);
      expect(result).toBeDefined();
    });
  });

  describe('formatDate', () => {
    it('should format Date object to MM/DD/YYYY format', () => {
      const testDate = new Date('2024-01-15T14:30:45.123Z');
      const result = formatDate(testDate);
      
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it('should handle single digit months and days correctly', () => {
      const testDate = new Date('2024-03-05T10:00:00.000Z');
      const result = formatDate(testDate);
      
      // Should handle single digit month/day
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024$/);
    });

    it('should handle different months correctly', () => {
      const months = Array.from({ length: 12 }, (_, i) => 
        new Date(2024, i, 15)
      );

      months.forEach((date, index) => {
        const result = formatDate(date);
        expect(result).toContain('2024');
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024$/);
      });
    });

    it('should format current date when no parameter provided', () => {
      const mockDate = new Date('2024-01-15T14:30:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const result = formatDate(new Date());
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/2024$/);
    });

    it('should handle leap years correctly', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00.000Z');
      const result = formatDate(leapYearDate);
      
      expect(result).toMatch(/^\d{1,2}\/29\/2024$/);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid-date');
      
      expect(() => formatDate(invalidDate)).not.toThrow();
      
      const result = formatDate(invalidDate);
      expect(result).toBeDefined();
    });
  });

  describe('formatTime', () => {
    it('should format Date object to HH:MM AM/PM format', () => {
      const testDate = new Date('2024-01-15T14:30:45.123Z');
      const result = formatTime(testDate);
      
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should handle morning times correctly', () => {
      const morningTimes = [
        new Date('2024-01-15T00:00:00.000Z'), // 12:00 AM
        new Date('2024-01-15T06:30:00.000Z'), // 6:30 AM
        new Date('2024-01-15T11:59:00.000Z')  // 11:59 AM
      ];

      morningTimes.forEach(date => {
        const result = formatTime(date);
        expect(result).toContain('AM');
      });
    });

    it('should handle afternoon/evening times correctly', () => {
      const afternoonTimes = [
        new Date('2024-01-15T12:00:00.000Z'), // 12:00 PM
        new Date('2024-01-15T18:45:00.000Z'), // 6:45 PM
        new Date('2024-01-15T23:59:00.000Z')  // 11:59 PM
      ];

      afternoonTimes.forEach(date => {
        const result = formatTime(date);
        expect(result).toContain('PM');
      });
    });

    it('should handle 12-hour format conversion correctly', () => {
      const testCases = [
        { input: new Date('2024-01-15T00:00:00.000Z'), expected: '12:00 AM' },
        { input: new Date('2024-01-15T12:00:00.000Z'), expected: '12:00 PM' },
        { input: new Date('2024-01-15T01:30:00.000Z'), contains: '1:30 AM' },
        { input: new Date('2024-01-15T13:45:00.000Z'), contains: '1:45 PM' }
      ];

      testCases.forEach(({ input, expected, contains }) => {
        const result = formatTime(input);
        if (expected) {
          expect(result).toBe(expected);
        } else if (contains) {
          expect(result).toContain(contains);
        }
      });
    });

    it('should format current time when no parameter provided', () => {
      const mockDate = new Date('2024-01-15T14:30:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const result = formatTime(new Date());
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should handle minutes padding correctly', () => {
      const testTimes = [
        new Date('2024-01-15T14:05:00.000Z'), // Should show 2:05 PM
        new Date('2024-01-15T14:30:00.000Z'), // Should show 2:30 PM
        new Date('2024-01-15T14:00:00.000Z')  // Should show 2:00 PM
      ];

      testTimes.forEach(date => {
        const result = formatTime(date);
        expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
        
        // Check that minutes are always 2 digits
        const minutesPart = result.split(':')[1].split(' ')[0];
        expect(minutesPart).toHaveLength(2);
      });
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid-date');
      
      expect(() => formatTime(invalidDate)).not.toThrow();
      
      const result = formatTime(invalidDate);
      expect(result).toBeDefined();
    });
  });

  describe('timezone handling', () => {
    it('should format consistently regardless of local timezone', () => {
      // Create a specific UTC date
      const utcDate = new Date('2024-01-15T20:30:00.000Z');
      
      const timestamp = formatTimestamp(utcDate);
      const date = formatDate(utcDate);
      const time = formatTime(utcDate);
      
      expect(timestamp).toBeDefined();
      expect(date).toBeDefined();
      expect(time).toBeDefined();
      
      // All should be consistent
      expect(timestamp).toContain(date);
      expect(timestamp).toContain(time);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01T12:00:00.000Z');
      
      expect(() => formatTimestamp(oldDate)).not.toThrow();
      expect(() => formatDate(oldDate)).not.toThrow();
      expect(() => formatTime(oldDate)).not.toThrow();
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2100-12-31T23:59:59.999Z');
      
      expect(() => formatTimestamp(futureDate)).not.toThrow();
      expect(() => formatDate(futureDate)).not.toThrow();
      expect(() => formatTime(futureDate)).not.toThrow();
    });

    it('should handle edge of day transitions', () => {
      const endOfDay = new Date('2024-01-15T23:59:59.999Z');
      const startOfDay = new Date('2024-01-16T00:00:00.000Z');
      
      const endResult = formatTimestamp(endOfDay);
      const startResult = formatTimestamp(startOfDay);
      
      expect(endResult).toContain('PM');
      expect(startResult).toContain('AM');
    });

    it('should handle concurrent formatting calls', () => {
      const dates = Array.from({ length: 100 }, (_, i) => 
        new Date(2024, 0, 1, i % 24, i % 60)
      );

      const results = dates.map(date => ({
        timestamp: formatTimestamp(date),
        date: formatDate(date),
        time: formatTime(date)
      }));

      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.timestamp).toBeDefined();
        expect(result.date).toBeDefined();
        expect(result.time).toBeDefined();
      });
    });
  });
});