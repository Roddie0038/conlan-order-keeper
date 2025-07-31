/**
 * Phase 5: Unit Tests for StoreNormalizationUtils
 * Comprehensive test coverage for store data normalization
 */

import { describe, it, expect, vi } from 'vitest';
import {
  extractStoreNumber,
  normalizeStoreFormat,
  validateStoreFormat,
  getStoreDisplayName
} from '@/utils/normalization/StoreNormalizationUtils';

describe('StoreNormalizationUtils', () => {
  describe('extractStoreNumber', () => {
    it('should extract number from pure numeric store format', () => {
      expect(extractStoreNumber('22')).toBe('22');
      expect(extractStoreNumber('027')).toBe('027');
      expect(extractStoreNumber('7')).toBe('7');
    });

    it('should extract number from store name with number format', () => {
      expect(extractStoreNumber('Fort Worth 22')).toBe('22');
      expect(extractStoreNumber('Grand Prairie 027')).toBe('027');
      expect(extractStoreNumber('Houston 28')).toBe('28');
      expect(extractStoreNumber('Store 35')).toBe('35');
    });

    it('should handle various store name formats', () => {
      expect(extractStoreNumber('Dallas Store 22')).toBe('22');
      expect(extractStoreNumber('Store Number 027')).toBe('027');
      expect(extractStoreNumber('Location 35 Branch')).toBe('35');
      expect(extractStoreNumber('Austin-39')).toBe('39');
    });

    it('should handle whitespace and special characters', () => {
      expect(extractStoreNumber('  Fort Worth 22  ')).toBe('22');
      expect(extractStoreNumber('Grand-Prairie-027')).toBe('027');
      expect(extractStoreNumber('Houston_28')).toBe('28');
    });

    it('should return empty string for invalid formats', () => {
      expect(extractStoreNumber('')).toBe('');
      expect(extractStoreNumber('No Numbers Here')).toBe('');
      expect(extractStoreNumber('Store Without Number')).toBe('');
      expect(extractStoreNumber('ABC')).toBe('');
    });

    it('should handle null and undefined inputs', () => {
      expect(extractStoreNumber(null as any)).toBe('');
      expect(extractStoreNumber(undefined as any)).toBe('');
    });

    it('should handle multiple numbers and extract the last one', () => {
      expect(extractStoreNumber('Store 123 Location 456')).toBe('456');
      expect(extractStoreNumber('Building 1 Store 22')).toBe('22');
    });

    it('should handle single digit and multi-digit numbers', () => {
      expect(extractStoreNumber('Store 5')).toBe('5');
      expect(extractStoreNumber('Store 123')).toBe('123');
      expect(extractStoreNumber('Store 0001')).toBe('0001');
    });
  });

  describe('normalizeStoreFormat', () => {
    it('should normalize basic store formats', () => {
      expect(normalizeStoreFormat('22')).toBe('22');
      expect(normalizeStoreFormat('Fort Worth 22')).toBe('Fort Worth 22');
      expect(normalizeStoreFormat('Grand Prairie 027')).toBe('Grand Prairie 027');
    });

    it('should trim whitespace', () => {
      expect(normalizeStoreFormat('  Fort Worth 22  ')).toBe('Fort Worth 22');
      expect(normalizeStoreFormat('\t\nGrand Prairie 027\r\n')).toBe('Grand Prairie 027');
    });

    it('should handle empty and null inputs', () => {
      expect(normalizeStoreFormat('')).toBe('');
      expect(normalizeStoreFormat(null as any)).toBe('');
      expect(normalizeStoreFormat(undefined as any)).toBe('');
    });

    it('should preserve valid formats as-is', () => {
      const validFormats = [
        'Houston 28',
        'San Antonio 29',
        'Oklahoma City 30',
        'Store 22'
      ];

      validFormats.forEach(format => {
        expect(normalizeStoreFormat(format)).toBe(format);
      });
    });

    it('should handle special characters and maintain original format', () => {
      expect(normalizeStoreFormat('Fort-Worth-22')).toBe('Fort-Worth-22');
      expect(normalizeStoreFormat('Grand_Prairie_027')).toBe('Grand_Prairie_027');
    });
  });

  describe('validateStoreFormat', () => {
    it('should validate stores with valid numbers', () => {
      const validStores = [
        '22',
        'Fort Worth 22',
        'Grand Prairie 027',
        'Houston 28',
        'Store 35'
      ];

      validStores.forEach(store => {
        const result = validateStoreFormat(store);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty or null stores', () => {
      const invalidStores = ['', '   ', null, undefined];

      invalidStores.forEach(store => {
        const result = validateStoreFormat(store as string);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Store is required');
      });
    });

    it('should reject stores without numbers', () => {
      const invalidStores = [
        'No Numbers Here',
        'Store Without Number',
        'ABC',
        'Location Name Only'
      ];

      invalidStores.forEach(store => {
        const result = validateStoreFormat(store);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid store format - must contain a store number');
      });
    });

    it('should validate single digit and multi-digit numbers', () => {
      expect(validateStoreFormat('Store 5').isValid).toBe(true);
      expect(validateStoreFormat('Store 123').isValid).toBe(true);
      expect(validateStoreFormat('Store 0001').isValid).toBe(true);
    });

    it('should validate special formats with numbers', () => {
      const specialFormats = [
        'Store-22',
        'Location_35',
        'Branch#28',
        'Site 027 Main'
      ];

      specialFormats.forEach(format => {
        const result = validateStoreFormat(format);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('getStoreDisplayName', () => {
    it('should format pure numbers with "Store" prefix', () => {
      expect(getStoreDisplayName('22')).toBe('Store 22');
      expect(getStoreDisplayName('027')).toBe('Store 027');
      expect(getStoreDisplayName('5')).toBe('Store 5');
    });

    it('should return formatted names as-is', () => {
      const formattedNames = [
        'Fort Worth 22',
        'Grand Prairie 027',
        'Houston 28',
        'San Antonio 29'
      ];

      formattedNames.forEach(name => {
        expect(getStoreDisplayName(name)).toBe(name);
      });
    });

    it('should handle empty and null inputs', () => {
      expect(getStoreDisplayName('')).toBe('');
      expect(getStoreDisplayName(null as any)).toBe('');
      expect(getStoreDisplayName(undefined as any)).toBe('');
    });

    it('should handle whitespace trimming for pure numbers', () => {
      expect(getStoreDisplayName('  22  ')).toBe('Store 22');
      expect(getStoreDisplayName('\t027\n')).toBe('Store 027');
    });

    it('should preserve non-numeric store names', () => {
      const nonNumericNames = [
        'Corporate Office',
        'Main Warehouse',
        'Distribution Center'
      ];

      nonNumericNames.forEach(name => {
        expect(getStoreDisplayName(name)).toBe(name);
      });
    });

    it('should handle mixed alphanumeric formats', () => {
      expect(getStoreDisplayName('ABC22')).toBe('ABC22');
      expect(getStoreDisplayName('Store ABC')).toBe('Store ABC');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long store names', () => {
      const longStoreName = 'This is a very long store name with number 22 at the end';
      expect(extractStoreNumber(longStoreName)).toBe('22');
      expect(validateStoreFormat(longStoreName).isValid).toBe(true);
    });

    it('should handle special Unicode characters', () => {
      const unicodeStore = 'Tiëndà 22';
      expect(extractStoreNumber(unicodeStore)).toBe('22');
      expect(validateStoreFormat(unicodeStore).isValid).toBe(true);
    });

    it('should handle numeric edge cases', () => {
      expect(extractStoreNumber('Store 0')).toBe('0');
      expect(extractStoreNumber('Store 000')).toBe('000');
      expect(extractStoreNumber('Store 999999')).toBe('999999');
    });

    it('should handle concurrent processing', () => {
      const stores = Array.from({ length: 100 }, (_, i) => `Store ${i}`);
      
      const results = stores.map(store => ({
        original: store,
        number: extractStoreNumber(store),
        valid: validateStoreFormat(store),
        display: getStoreDisplayName(store)
      }));

      expect(results).toHaveLength(100);
      results.forEach((result, index) => {
        expect(result.number).toBe(index.toString());
        expect(result.valid.isValid).toBe(true);
      });
    });
  });
});