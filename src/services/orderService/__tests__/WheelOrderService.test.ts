/**
 * Phase 5: Unit Tests for WheelOrderService
 * Comprehensive test coverage for wheel order business logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WheelOrderService } from '@/services/orderService/WheelOrderService';
import { WheelFormData } from '@/components/wheel-order/types';

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
  submitWheelOrder: vi.fn()
}));

vi.mock('@/utils/emailUtils', () => ({
  getFirstManagerEmail: vi.fn()
}));

describe('WheelOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateWheelForm', () => {
    it('should validate required fields for non-admin users', () => {
      const validFormData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: 'Fort Worth 22',
        storeColors: 'Black',
        destinationPlant: 'Dallas'
      };

      const errors = WheelOrderService.validateWheelForm(validFormData, false);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate required fields for admin users (no store requirement)', () => {
      const validFormData: WheelFormData = {
        yourName: 'Admin User',
        storeName: '',
        storeId: '',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: 'Black',
        destinationPlant: 'Dallas'
      };

      const errors = WheelOrderService.validateWheelForm(validFormData, true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidFormData: WheelFormData = {
        yourName: '',
        storeName: '',
        storeId: '',
        dateReceived: '',
        qtyWheels: '',
        customerName: '',
        wheelMaterial: '',
        wheelType: '',
        handHoles: '',
        wheelSize: '',
        wheelColor: '',
        scheduleArrival: '',
        userStore: '',
        storeColors: '',
        destinationPlant: ''
      };

      const errors = WheelOrderService.validateWheelForm(invalidFormData, false);
      
      expect(errors.yourName).toBe('Name is required');
      expect(errors.storeName).toBe('Store is required');
      expect(errors.qtyWheels).toBe('Quantity of wheels is required');
      expect(errors.customerName).toBe('Customer name is required');
      expect(errors.wheelMaterial).toBe('Wheel material is required');
      expect(errors.wheelType).toBe('Wheel type is required');
      expect(errors.handHoles).toBe('Hand holes specification is required');
      expect(errors.wheelSize).toBe('Wheel size is required');
      expect(errors.wheelColor).toBe('Wheel color is required');
      expect(errors.scheduleArrival).toBe('Schedule arrival is required');
      expect(errors.destinationPlant).toBe('Destination plant is required');
    });

    it('should validate quantity as a number', () => {
      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: 'not-a-number',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const errors = WheelOrderService.validateWheelForm(formData, false);
      expect(errors.qtyWheels).toBe('Quantity must be a valid number');
    });

    it('should validate quantity is greater than 0', () => {
      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '0',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const errors = WheelOrderService.validateWheelForm(formData, false);
      expect(errors.qtyWheels).toBe('Quantity must be greater than 0');
    });
  });

  describe('getManagerEmail', () => {
    it('should return manager email for valid store', async () => {
      const { getFirstManagerEmail } = await import('@/utils/emailUtils');
      vi.mocked(getFirstManagerEmail).mockResolvedValue('manager@store.com');

      const result = await WheelOrderService.getManagerEmail('Fort Worth 22');
      
      expect(result).toBe('manager@store.com');
      expect(getFirstManagerEmail).toHaveBeenCalledWith('Fort Worth 22');
    });

    it('should return empty string for empty store', async () => {
      const result = await WheelOrderService.getManagerEmail('');
      expect(result).toBe('');
    });

    it('should handle errors gracefully', async () => {
      const { getFirstManagerEmail } = await import('@/utils/emailUtils');
      vi.mocked(getFirstManagerEmail).mockRejectedValue(new Error('API Error'));

      const result = await WheelOrderService.getManagerEmail('Fort Worth 22');
      expect(result).toBe('');
    });
  });

  describe('prepareWheelOrder', () => {
    it('should prepare wheel order with correct format', () => {
      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: 'Fort Worth 22',
        storeColors: 'Black',
        destinationPlant: 'Dallas'
      };

      const prepared = WheelOrderService.prepareWheelOrder(formData);

      expect(prepared.your_name).toBe('John Doe');
      expect(prepared.store_name).toBe('Fort Worth 22');
      expect(prepared.store_id).toBe('22');
      expect(prepared.date_received).toBe('2024-01-15');
      expect(prepared.qty_wheels).toBe(4);
      expect(prepared.customer_name).toBe('Customer Name');
      expect(prepared.wheel_material).toBe('Steel');
      expect(prepared.wheel_type).toBe('Standard');
      expect(prepared.hand_holes).toBe('Yes');
      expect(prepared.wheel_size).toBe('22.5');
      expect(prepared.wheel_color).toBe('Black');
      expect(prepared.schedule_arrival).toBe('2024-01-20');
      expect(prepared.user_store).toBe('Fort Worth 22');
      expect(prepared.store_colors).toBe('Black');
      expect(prepared.destination_plant).toBe('Dallas');
      expect(prepared.order_type).toBe('WHEEL_POWDER_COATING');
      expect(prepared.id).toBeDefined();
      expect(prepared.timestamp).toBeDefined();
    });

    it('should handle zero quantity gracefully', () => {
      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const prepared = WheelOrderService.prepareWheelOrder(formData);
      expect(prepared.qty_wheels).toBe(0);
    });
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      const { submitWheelOrder } = await import('@/utils/orderSubmissionUtils');
      vi.mocked(submitWheelOrder).mockResolvedValue({
        success: true,
        data: { id: 'wheel-123' } as any
      });

      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const result = await WheelOrderService.submitOrder(formData, false);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('wheel-123');
    });

    it('should handle validation errors', async () => {
      const invalidFormData: WheelFormData = {
        yourName: '',
        storeName: '',
        storeId: '',
        dateReceived: '',
        qtyWheels: '',
        customerName: '',
        wheelMaterial: '',
        wheelType: '',
        handHoles: '',
        wheelSize: '',
        wheelColor: '',
        scheduleArrival: '',
        userStore: '',
        storeColors: '',
        destinationPlant: ''
      };

      const result = await WheelOrderService.submitOrder(invalidFormData, false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should handle submission errors', async () => {
      const { submitWheelOrder } = await import('@/utils/orderSubmissionUtils');
      vi.mocked(submitWheelOrder).mockRejectedValue(new Error('Database error'));

      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: 'Fort Worth 22',
        storeId: '22',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const result = await WheelOrderService.submitOrder(formData, false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createDefaultFormData', () => {
    it('should create default form data with current date', () => {
      const defaultData = WheelOrderService.createDefaultFormData();

      expect(defaultData.yourName).toBe('');
      expect(defaultData.storeName).toBe('');
      expect(defaultData.qtyWheels).toBe('');
      expect(defaultData.destinationPlant).toBe('');
      expect(defaultData.dateReceived).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('updateStoreInfo', () => {
    it('should update store information', () => {
      const formData: WheelFormData = {
        yourName: 'John Doe',
        storeName: '',
        storeId: '',
        dateReceived: '2024-01-15',
        qtyWheels: '4',
        customerName: 'Customer Name',
        wheelMaterial: 'Steel',
        wheelType: 'Standard',
        handHoles: 'Yes',
        wheelSize: '22.5',
        wheelColor: 'Black',
        scheduleArrival: '2024-01-20',
        userStore: '',
        storeColors: '',
        destinationPlant: 'Dallas'
      };

      const updated = WheelOrderService.updateStoreInfo(formData, 'Fort Worth 22', '22');

      expect(updated.storeName).toBe('Fort Worth 22');
      expect(updated.storeId).toBe('22');
      expect(updated.yourName).toBe('John Doe'); // Other fields preserved
    });
  });
});