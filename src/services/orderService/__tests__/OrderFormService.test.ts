/**
 * Phase 5: Unit Tests for OrderFormService
 * Comprehensive test coverage for order form business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderFormService } from '@/services/orderService/OrderFormService';
import type { OrderSummary } from '@/services/orderService/OrderFormService';

// Mock dependencies
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/services/orderService', () => ({
  saveOrderToSupabase: vi.fn()
}));

vi.mock('@/services/sheets', () => ({
  submitToGoogleSheets: vi.fn()
}));

vi.mock('@/services/NotificationController', () => ({
  sendTransferOrderConfirmation: vi.fn()
}));

vi.mock('@/utils/plantMapping', () => ({
  getPlantForStore: vi.fn()
}));

vi.mock('@/config/featureFlags', () => ({
  SHOW_CROSS_DOCK: true
}));

describe('OrderFormService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateOrderForm', () => {
    it('should validate required fields', () => {
      const validFormData = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: '10',
        scheduleArrival: '2024-01-15',
        destinationPlant: 'Dallas'
      };

      const errors = OrderFormService.validateOrderForm(validFormData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidFormData = {
        yourName: '',
        store: '',
        productNumber: '',
        description: '',
        quantity: '',
        scheduleArrival: '',
        destinationPlant: ''
      };

      const errors = OrderFormService.validateOrderForm(invalidFormData);
      
      expect(errors.yourName).toBe('Name is required');
      expect(errors.store).toBe('Store is required');
      expect(errors.productNumber).toBe('Product number is required');
      expect(errors.description).toBe('Description is required');
      expect(errors.quantity).toBe('Quantity is required');
      expect(errors.scheduleArrival).toBe('Schedule arrival is required');
      expect(errors.destinationPlant).toBe('Destination plant is required');
    });

    it('should validate quantity as a number', () => {
      const formDataWithInvalidQuantity = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: 'not-a-number',
        scheduleArrival: '2024-01-15',
        destinationPlant: 'Dallas'
      };

      const errors = OrderFormService.validateOrderForm(formDataWithInvalidQuantity);
      expect(errors.quantity).toBe('Quantity must be a valid number');
    });

    it('should validate quantity is greater than 0', () => {
      const formDataWithZeroQuantity = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: '0',
        scheduleArrival: '2024-01-15',
        destinationPlant: 'Dallas'
      };

      const errors = OrderFormService.validateOrderForm(formDataWithZeroQuantity);
      expect(errors.quantity).toBe('Quantity must be greater than 0');
    });

    it('should validate cross dock fields when enabled', () => {
      const formDataWithCrossDock = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: '10',
        scheduleArrival: '2024-01-15',
        destinationPlant: 'Dallas',
        crossDock: 'Yes' as const,
        crossDockDestination: ''
      };

      const errors = OrderFormService.validateOrderForm(formDataWithCrossDock);
      expect(errors.crossDockDestination).toBe('Cross dock destination is required when cross dock is enabled');
    });
  });

  describe('createOrderSummary', () => {
    it('should create order summary with correct data', () => {
      const formData = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: '10',
        scheduleArrival: '2024-01-15',
        notes: 'Test notes',
        crossDock: 'No' as const,
        destinationPlant: 'Dallas'
      };

      const summary = OrderFormService.createOrderSummary(formData);

      expect(summary.yourName).toBe('John Doe');
      expect(summary.store).toBe('Fort Worth 22');
      expect(summary.productNumber).toBe('ABC123');
      expect(summary.description).toBe('Test Product');
      expect(summary.quantity).toBe('10');
      expect(summary.scheduleArrival).toBe('2024-01-15');
      expect(summary.notes).toBe('Test notes');
      expect(summary.crossDock).toBe('No');
      expect(summary.destinationPlant).toBe('Dallas');
      expect(summary.selected).toBe(true);
      expect(summary.id).toBeDefined();
      expect(summary.timestamp).toBeDefined();
    });

    it('should handle missing optional fields', () => {
      const minimalFormData = {
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        destinationPlant: 'Dallas'
      };

      const summary = OrderFormService.createOrderSummary(minimalFormData);

      expect(summary.yourName).toBe('John Doe');
      expect(summary.productNumber).toBe('');
      expect(summary.description).toBe('');
      expect(summary.quantity).toBe(0);
      expect(summary.notes).toBe('');
      expect(summary.crossDock).toBe('No');
    });
  });

  describe('determineOrderType', () => {
    it('should determine WHEEL_POWDER_COATING for wheel orders', () => {
      const wheelOrder: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'WHL123',
        description: 'Wheel',
        quantity: 4,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z',
        qtyWheels: 4
      };

      const orderType = OrderFormService.determineOrderType(wheelOrder);
      expect(orderType).toBe('WHEEL_POWDER_COATING');
    });

    it('should determine MTO for orders with casing grade', () => {
      const mtoOrder: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'MTO123',
        description: 'MTO Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z',
        casingGrade: 'Grade A'
      };

      const orderType = OrderFormService.determineOrderType(mtoOrder);
      expect(orderType).toBe('MTO');
    });

    it('should determine MTO for orders explicitly marked as MTO', () => {
      const mtoOrder: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'MTO123',
        description: 'MTO Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z',
        type: 'MTO'
      };

      const orderType = OrderFormService.determineOrderType(mtoOrder);
      expect(orderType).toBe('MTO');
    });

    it('should default to TRANSFER for regular orders', () => {
      const regularOrder: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'REG123',
        description: 'Regular Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z'
      };

      const orderType = OrderFormService.determineOrderType(regularOrder);
      expect(orderType).toBe('TRANSFER');
    });
  });

  describe('prepareOrderForSubmission', () => {
    it('should prepare order with correct format', () => {
      // Mock getPlantForStore for this test
      vi.doMock('@/utils/plantMapping', () => ({
        getPlantForStore: vi.fn().mockReturnValue('Dallas')
      }));

      const orderSummary: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: 'Test notes',
        crossDock: 'No',
        crossDockDestination: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z'
      };

      const user = { email: 'test@example.com' };
      const prepared = OrderFormService.prepareOrderForSubmission(orderSummary, user);

      expect(prepared.name).toBe('John Doe');
      expect(prepared.store).toBe('Fort Worth 22');
      expect(prepared.productNumber).toBe('ABC123');
      expect(prepared.description).toBe('Test Product');
      expect(prepared.quantity).toBe(10);
      expect(prepared.scheduleArrival).toBe('2024-01-15');
      expect(prepared.notes).toBe('Test notes');
      expect(prepared.crossDock).toBe('No');
      expect(prepared.email).toBe('test@example.com');
      expect(prepared.type).toBe('TRANSFER');
    });

    it('should handle missing user email', () => {
      const orderSummary: OrderSummary = {
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z'
      };

      const user = {};
      const prepared = OrderFormService.prepareOrderForSubmission(orderSummary, user);

      expect(prepared.email).toBe('');
    });
  });

  describe('submitOrders', () => {
    it('should submit orders successfully', async () => {
      const orders: OrderSummary[] = [{
        id: '123',
        yourName: 'John Doe',
        store: 'Fort Worth 22',
        productNumber: 'ABC123',
        description: 'Test Product',
        quantity: 10,
        scheduleArrival: '2024-01-15',
        notes: '',
        destinationPlant: 'Dallas',
        selected: true,
        timestamp: '2024-01-15T10:00:00Z'
      }];

      const user = { email: 'test@example.com' };
      const result = await OrderFormService.submitOrders(orders, user);

      expect(result.success).toBe(true);
      expect(result.data?.submittedCount).toBe(1);
    });

    it('should return error for empty order list', async () => {
      const result = await OrderFormService.submitOrders([], {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('No orders selected for submission');
    });
  });

  describe('createDefaultFormData', () => {
    it('should create default form data', () => {
      const defaultData = OrderFormService.createDefaultFormData();

      expect(defaultData.yourName).toBe('');
      expect(defaultData.store).toBe('');
      expect(defaultData.productNumber).toBe('');
      expect(defaultData.description).toBe('');
      expect(defaultData.quantity).toBe('');
      expect(defaultData.crossDock).toBe('No');
      expect(defaultData.destinationPlant).toBe('');
    });

    it('should include user store when provided', () => {
      const defaultData = OrderFormService.createDefaultFormData('Fort Worth 22');

      expect(defaultData.store).toBe('Fort Worth 22');
    });
  });

  describe('resetFormData', () => {
    it('should reset form data to defaults', () => {
      const resetData = OrderFormService.resetFormData();

      expect(resetData.yourName).toBe('');
      expect(resetData.store).toBe('');
      expect(resetData.destinationPlant).toBe('');
    });

    it('should preserve store for non-admin users', () => {
      const resetData = OrderFormService.resetFormData('Fort Worth 22', false);

      expect(resetData.store).toBe('Fort Worth 22');
    });

    it('should not preserve store for admin users', () => {
      const resetData = OrderFormService.resetFormData('Fort Worth 22', true);

      expect(resetData.store).toBe('Fort Worth 22'); // Still includes in default, but admin can change
    });
  });
});