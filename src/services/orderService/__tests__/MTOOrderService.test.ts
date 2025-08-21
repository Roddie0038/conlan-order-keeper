/**
 * Phase 5: Unit Tests for MTOOrderService
 * Comprehensive test coverage for MTO order business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MTOOrderService } from '@/services/orderService/MTOOrderService';
import { MTOFormData } from '@/components/mto-order/mto-form-config';

// Mock dependencies
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/utils/orderSubmissionUtils', () => ({
  submitMTOOrder: vi.fn()
}));

vi.mock('@/utils/emailUtils', () => ({
  getFirstManagerEmail: vi.fn()
}));

describe('MTOOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateMTOForm', () => {
    it('should validate required fields', () => {
      const validFormData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A'],
        tireSize: '275/80R22.5',
        customTireSize: '',
        tireTreadNeeded: 'Standard',
        quantity: '10',
        notes: 'Test notes',
        managerEmail: 'manager@store.com',
        destinationPlant: 'Dallas'
      };

      const errors = MTOOrderService.validateMTOForm(validFormData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidFormData: MTOFormData = {
        store: '',
        name: '',
        timestamp: '',
        productNumber: '',
        casingGrade: [],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '',
        notes: '',
        managerEmail: '',
        destinationPlant: ''
      };

      const errors = MTOOrderService.validateMTOForm(invalidFormData);
      
      expect(errors.store).toBe('Store is required');
      expect(errors.name).toBe('Name is required');
      expect(errors.productNumber).toBe('Product number is required');
      expect(errors.quantity).toBe('Quantity is required');
      expect(errors.destinationPlant).toBe('Destination plant is required');
    });

    it('should validate quantity as a number', () => {
      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A'],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: 'not-a-number',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const errors = MTOOrderService.validateMTOForm(formData);
      expect(errors.quantity).toBe('Quantity must be a valid number');
    });

    it('should validate casing grade selection', () => {
      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: [],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '10',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const errors = MTOOrderService.validateMTOForm(formData);
      expect(errors.casingGrade).toBe('At least one casing grade must be selected');
    });
  });

  describe('getManagerEmail', () => {
    it('should return manager email for valid store', async () => {
      const { getFirstManagerEmail } = await import('@/utils/emailUtils');
      vi.mocked(getFirstManagerEmail).mockResolvedValue('manager@store.com');

      const result = await MTOOrderService.getManagerEmail('Fort Worth 22');
      
      expect(result).toBe('manager@store.com');
      expect(getFirstManagerEmail).toHaveBeenCalledWith('Fort Worth 22');
    });

    it('should return empty string for empty store', async () => {
      const result = await MTOOrderService.getManagerEmail('');
      expect(result).toBe('');
    });

    it('should handle errors gracefully', async () => {
      const { getFirstManagerEmail } = await import('@/utils/emailUtils');
      vi.mocked(getFirstManagerEmail).mockRejectedValue(new Error('API Error'));

      const result = await MTOOrderService.getManagerEmail('Fort Worth 22');
      expect(result).toBe('');
    });
  });

  describe('prepareMTOOrder', () => {
    it('should prepare MTO order with correct format', () => {
      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A', 'Grade B'],
        tireSize: '275/80R22.5',
        customTireSize: 'Custom Size',
        tireTreadNeeded: 'Standard',
        quantity: '10',
        notes: 'Test notes',
        managerEmail: 'manager@store.com',
        destinationPlant: 'Dallas'
      };

      const prepared = MTOOrderService.prepareMTOOrder(formData);

      expect(prepared.store).toBe('Fort Worth 22');
      expect(prepared.name).toBe('John Doe');
      expect(prepared.product_number).toBe('ABC123');
      expect(prepared.casing_grade).toBe('Grade A, Grade B');
      expect(prepared.tire_size).toBe('275/80R22.5');
      expect(prepared.custom_tire_size).toBe('Custom Size');
      expect(prepared.tire_tread_needed).toBe('Standard');
      expect(prepared.quantity).toBe(10);
      expect(prepared.notes).toBe('Test notes');
      expect(prepared.manager_email).toBe('manager@store.com');
      expect(prepared.destination_plant).toBe('Dallas');
      expect(prepared.order_type).toBe('MTO');
      expect(prepared.id).toBeDefined();
      expect(prepared.timestamp).toBeDefined();
    });

    it('should handle array casing grade', () => {
      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A'],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '5',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const prepared = MTOOrderService.prepareMTOOrder(formData);
      expect(prepared.casing_grade).toBe('Grade A');
    });

    it('should handle string casing grade', () => {
      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: 'Grade A' as any,
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '5',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const prepared = MTOOrderService.prepareMTOOrder(formData);
      expect(prepared.casing_grade).toBe('Grade A');
    });
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      const { submitMTOOrder } = await import('@/utils/orderSubmissionUtils');
      vi.mocked(submitMTOOrder).mockResolvedValue({
        success: true,
        data: { id: 'mto-123' } as any
      });

      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A'],
        tireSize: '275/80R22.5',
        customTireSize: '',
        tireTreadNeeded: 'Standard',
        quantity: '10',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const result = await MTOOrderService.submitOrder(formData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('mto-123');
    });

    it('should handle validation errors', async () => {
      const invalidFormData: MTOFormData = {
        store: '',
        name: '',
        timestamp: '',
        productNumber: '',
        casingGrade: [],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '',
        notes: '',
        managerEmail: '',
        destinationPlant: ''
      };

      const result = await MTOOrderService.submitOrder(invalidFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should handle submission errors', async () => {
      const { submitMTOOrder } = await import('@/utils/orderSubmissionUtils');
      vi.mocked(submitMTOOrder).mockRejectedValue(new Error('Database error'));

      const formData: MTOFormData = {
        store: 'Fort Worth 22',
        name: 'John Doe',
        timestamp: '2024-01-15 10:00 AM',
        productNumber: 'ABC123',
        casingGrade: ['Grade A'],
        tireSize: '',
        customTireSize: '',
        tireTreadNeeded: '',
        quantity: '10',
        notes: '',
        managerEmail: '',
        destinationPlant: 'Dallas'
      };

      const result = await MTOOrderService.submitOrder(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createDefaultFormData', () => {
    it('should create default form data', () => {
      const defaultData = MTOOrderService.createDefaultFormData();

      expect(defaultData.store).toBe('');
      expect(defaultData.name).toBe('');
      expect(defaultData.productNumber).toBe('');
      expect(defaultData.casingGrade).toEqual([]);
      expect(defaultData.quantity).toBe('');
      expect(defaultData.destinationPlant).toBe('');
    });

    it('should include user store when provided', () => {
      const defaultData = MTOOrderService.createDefaultFormData('Fort Worth 22');

      expect(defaultData.store).toBe('Fort Worth 22');
    });
  });

  describe('resetFormData', () => {
    it('should reset form data to defaults', () => {
      const resetData = MTOOrderService.resetFormData();

      expect(resetData.store).toBe('');
      expect(resetData.destinationPlant).toBe('');
    });

    it('should preserve user store when provided', () => {
      const resetData = MTOOrderService.resetFormData('Fort Worth 22');

      expect(resetData.store).toBe('Fort Worth 22');
    });
  });
});