/**
 * Phase 5: Unit Tests for UUIDUtils
 * Comprehensive test coverage for UUID generation and validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateUUID, isValidUUID, generateShortId } from '@/utils/uuid/UUIDUtils';

describe('UUIDUtils', () => {
  // Store original crypto.randomUUID for restoration
  const originalRandomUUID = global.crypto?.randomUUID;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original crypto.randomUUID if it was mocked
    if (originalRandomUUID) {
      global.crypto.randomUUID = originalRandomUUID;
    }
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID using crypto.randomUUID when available', () => {
      const mockUUID = '12345678-1234-4567-8901-123456789012';
      vi.mocked(crypto.randomUUID).mockReturnValue(mockUUID);

      const result = generateUUID();
      
      expect(result).toBe(mockUUID);
      expect(crypto.randomUUID).toHaveBeenCalledOnce();
    });

    it('should generate a valid UUID using fallback method when crypto.randomUUID is not available', () => {
      // Temporarily remove crypto.randomUUID
      const originalCrypto = global.crypto;
      global.crypto = undefined as any;

      const result = generateUUID();
      
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result).toContain('-');
      expect(result.length).toBe(36);

      // Restore crypto
      global.crypto = originalCrypto;
    });

    it('should generate unique UUIDs on multiple calls', () => {
      // Use real crypto.randomUUID for this test
      if (global.crypto?.randomUUID) {
        vi.restoreAllMocks();
      }

      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it('should handle errors gracefully and return emergency fallback', () => {
      // Mock crypto.randomUUID to throw an error
      global.crypto = {
        randomUUID: vi.fn(() => {
          throw new Error('Crypto not available');
        })
      } as any;

      const result = generateUUID();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return fallback UUID when crypto throws error', () => {
      const mockError = new Error('Crypto unavailable');
      vi.mocked(crypto.randomUUID).mockImplementation(() => {
        throw mockError;
      });

      // Mock Date.now and Math.random for consistent fallback
      const mockNow = 1234567890;
      const mockRandom = 0.5;
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);
      vi.spyOn(Math, 'random').mockReturnValue(mockRandom);

      const result = generateUUID();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      // Clean up
      vi.restoreAllMocks();
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUID v4 format', () => {
      const validUUIDs = [
        '12345678-1234-4567-8901-123456789012',
        'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789',
        '00000000-0000-4000-8000-000000000000',
        'ffffffff-ffff-4fff-afff-ffffffffffff'
      ];

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should validate UUID with different versions', () => {
      const uuidVersions = [
        '12345678-1234-1567-8901-123456789012', // v1
        '12345678-1234-2567-8901-123456789012', // v2
        '12345678-1234-3567-8901-123456789012', // v3
        '12345678-1234-4567-8901-123456789012', // v4
        '12345678-1234-5567-8901-123456789012'  // v5
      ];

      uuidVersions.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '12345678-1234-4567-8901',
        '12345678-1234-4567-8901-123456789012-extra',
        '12345678_1234_4567_8901_123456789012',
        '12345678-1234-4567-8901-12345678901g',
        'gggggggg-gggg-gggg-gggg-gggggggggggg',
        '12345678-1234-67-8901-123456789012',
        '12345678-12344567-8901-123456789012',
        null,
        undefined
      ];

      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid as string)).toBe(false);
      });
    });

    it('should handle case insensitive validation', () => {
      const mixedCaseUUID = 'A1B2C3D4-E5F6-4789-A012-B3C4D5E6F789';
      const lowerCaseUUID = 'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789';
      
      expect(isValidUUID(mixedCaseUUID)).toBe(true);
      expect(isValidUUID(lowerCaseUUID)).toBe(true);
    });
  });

  describe('generateShortId', () => {
    it('should generate an 8-character short ID', () => {
      const shortId = generateShortId();
      
      expect(shortId).toBeDefined();
      expect(typeof shortId).toBe('string');
      expect(shortId.length).toBe(8);
    });

    it('should generate alphanumeric short IDs', () => {
      const shortId = generateShortId();
      
      expect(shortId).toMatch(/^[a-z0-9]{8}$/);
    });

    it('should generate different short IDs on multiple calls', () => {
      const shortId1 = generateShortId();
      const shortId2 = generateShortId();
      const shortId3 = generateShortId();

      expect(shortId1).not.toBe(shortId2);
      expect(shortId2).not.toBe(shortId3);
      expect(shortId1).not.toBe(shortId3);
    });

    it('should handle Math.random errors gracefully', () => {
      // Mock Math.random to throw error
      const originalRandom = Math.random;
      Math.random = vi.fn(() => {
        throw new Error('Random not available');
      });

      const result = generateShortId();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(8);

      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should return fallback when Math.random fails', () => {
      const mockError = new Error('Random unavailable');
      const originalRandom = Math.random;
      Math.random = vi.fn(() => {
        throw mockError;
      });

      // Mock Date.now for consistent fallback
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      const result = generateShortId();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      // Clean up
      Math.random = originalRandom;
      vi.restoreAllMocks();
    });
  });

  describe('edge cases and error handling', () => {
    it('should work in environment without crypto API', () => {
      const originalCrypto = global.crypto;
      global.crypto = undefined as any;

      expect(() => generateUUID()).not.toThrow();
      expect(() => generateShortId()).not.toThrow();
      
      const uuid = generateUUID();
      const shortId = generateShortId();
      
      expect(uuid).toBeDefined();
      expect(shortId).toBeDefined();

      global.crypto = originalCrypto;
    });

    it('should handle concurrent UUID generation', async () => {
      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(generateUUID())
      );

      const results = await Promise.all(promises);
      const uniqueResults = new Set(results);

      expect(uniqueResults.size).toBe(100);
    });
  });
});