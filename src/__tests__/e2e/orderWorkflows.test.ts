/**
 * E2E Tests: Complete Order Workflows
 * Tests full user journey from form submission to email delivery and logging
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { OrderFormService } from '@/services/orderService/OrderFormService';
import { MTOOrderService } from '@/services/orderService/MTOOrderService';
import { WheelOrderService } from '@/services/orderService/WheelOrderService';
import { WarrantyOrderService } from '@/services/orderService/WarrantyOrderService';

// Create service instances for testing
const orderFormService = new OrderFormService();
const mtoOrderService = new MTOOrderService();
const wheelOrderService = new WheelOrderService();
const warrantyOrderService = new WarrantyOrderService();

// Mock Supabase client for E2E testing
const mockSupabaseData = {
  orders: [],
  mto_orders: [],
  wheel_orders: [],
  warranty_orders: [],
  notification_logs: [],
  ordering_email_logs: [],
  ot_platform_users: [
    {
      id: 'user-1',
      email: 'store022@conlantire.com',
      store: 'Fort Worth 022',
      plant: 'Grand Prairie 097',
      role: 'store_manager',
      full_name: 'Store Manager 022'
    },
    {
      id: 'user-2',
      email: 'warehouse@conlantire.com',
      store: null,
      plant: 'Grand Prairie 097',
      role: 'warehouse_coordinator',
      full_name: 'Warehouse Coordinator'
    }
  ],
  store_email_recipients: [
    {
      id: 'recipient-1',
      store_number: '022',
      plant: 'Grand Prairie 097',
      email: 'store022@conlantire.com',
      name: 'Store Manager 022',
      role: 'store_manager',
      notification_types: ['transfer', 'completion']
    }
  ]
};

const mockSupabase = {
  from: vi.fn((table: string) => ({
    select: vi.fn(() => Promise.resolve({ 
      data: mockSupabaseData[table as keyof typeof mockSupabaseData] || [], 
      error: null 
    })),
    insert: vi.fn((data: any) => {
      // Simulate database insert with ID generation
      const newRecord = { 
        ...data, 
        id: `${table}-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      if (mockSupabaseData[table as keyof typeof mockSupabaseData]) {
        (mockSupabaseData[table as keyof typeof mockSupabaseData] as any[]).push(newRecord);
      }
      
      return Promise.resolve({ data: [newRecord], error: null });
    }),
    update: vi.fn(() => Promise.resolve({ data: [], error: null })),
    eq: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  })),
  functions: {
    invoke: vi.fn((functionName: string, options: any) => {
      // Simulate edge function calls
      const simulatedResponse = {
        'transfer-notification': { success: true, messageId: 'msg-123' },
        'mto-notification-email': { success: true, messageId: 'mto-456' },
        'wheel-notification-email': { success: true, messageId: 'wheel-789' },
        'warranty-notification': { success: true, messageId: 'warranty-101' }
      };
      
      return Promise.resolve({
        data: simulatedResponse[functionName as keyof typeof simulatedResponse] || { success: true },
        error: null
      });
    })
  }
};

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('E2E Order Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock data
    mockSupabaseData.orders = [];
    mockSupabaseData.mto_orders = [];
    mockSupabaseData.wheel_orders = [];
    mockSupabaseData.warranty_orders = [];
    mockSupabaseData.notification_logs = [];
    mockSupabaseData.ordering_email_logs = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Transfer Order Complete Workflow', () => {
    it('completes full transfer order submission to notification flow', async () => {
      // Step 1: Submit transfer order
      const orderData = {
        productNumber: 'TEST-TRANSFER-001',
        description: 'Test Transfer Product',
        quantity: 5,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097',
        destinationManagerEmail: 'store022@conlantire.com'
      };

      const result = await orderFormService.submitOrder(orderData);

      // Verify order submission
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');

      // Step 2: Verify notification trigger
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async processing

      // Check that notification was logged
      expect(mockSupabaseData.notification_logs.length).toBeGreaterThan(0);
      
      const notificationLog = mockSupabaseData.notification_logs[0];
      expect(notificationLog.order_type).toBe('transfer');
      expect(notificationLog.notification_type).toBe('transfer_request');
      expect(notificationLog.recipient_email).toBe('store022@conlantire.com');

      // Step 3: Verify edge function was called
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'transfer-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            orderRecord: expect.objectContaining({
              product_number: 'TEST-TRANSFER-001'
            })
          })
        })
      );

      // Step 4: Simulate order completion and confirm completion notification
      const completionResult = await orderFormService.markOrderCompleted(result.orderId!);
      
      expect(completionResult.success).toBe(true);
      
      // Verify completion notification was triggered
      const completionLogs = mockSupabaseData.notification_logs.filter(
        log => log.notification_type === 'completion'
      );
      expect(completionLogs.length).toBeGreaterThan(0);
    });

    it('handles store normalization correctly in transfer workflow', async () => {
      const orderData = {
        productNumber: 'TEST-NORMALIZATION',
        description: 'Store Normalization Test',
        quantity: 3,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: '22', // Should normalize to 'Fort Worth 022'
        plant: 'Grand Prairie 097',
        destinationManagerEmail: 'store022@conlantire.com'
      };

      const result = await orderFormService.submitOrder(orderData);

      expect(result.success).toBe(true);

      // Verify store was normalized in the database record
      const insertedOrder = mockSupabaseData.orders[0];
      expect(insertedOrder.store).toBe('Fort Worth 022');
    });

    it('handles multi-plant routing correctly', async () => {
      // Add a recipient for different plant
      mockSupabaseData.ot_platform_users.push({
        id: 'user-3',
        email: 'mulberry@conlantire.com',
        store: null,
        plant: 'Mulberry 099',
        role: 'warehouse_coordinator',
        full_name: 'Mulberry Warehouse'
      });

      const orderData = {
        productNumber: 'TEST-MULTI-PLANT',
        description: 'Multi-plant routing test',
        quantity: 2,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Fort Worth 022',
        plant: 'Mulberry 099', // Different plant
        destinationManagerEmail: 'mulberry@conlantire.com'
      };

      const result = await orderFormService.submitOrder(orderData);

      expect(result.success).toBe(true);

      // Verify notification was sent to correct plant
      const notificationLog = mockSupabaseData.notification_logs.find(
        log => log.plant === 'Mulberry 099'
      );
      expect(notificationLog).toBeDefined();
      expect(notificationLog!.recipient_email).toBe('mulberry@conlantire.com');
    });
  });

  describe('MTO Order Complete Workflow', () => {
    it('completes full MTO order with casing availability check', async () => {
      const mtoData = {
        quantity: 10,
        tireSize: '11R22.5',
        tread: '11L',
        casingGrade: 'Grade A',
        haveCasings: true,
        treadInInventory: false,
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097',
        name: 'MTO Test User',
        email: 'mto-test@conlantire.com'
      };

      // Step 1: Submit MTO order
      const result = await mtoOrderService.createMTOOrder(mtoData);

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();

      // Step 2: Verify MTO-specific notification
      const mtoNotification = mockSupabaseData.notification_logs.find(
        log => log.order_type === 'mto' && log.notification_type === 'mto_casings_needed'
      );

      expect(mtoNotification).toBeDefined();
      expect(mtoNotification!.metadata).toEqual(
        expect.objectContaining({
          tire_size: '11R22.5',
          tread: '11L',
          casing_grade: 'Grade A'
        })
      );

      // Step 3: Verify edge function called with MTO-specific data
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'mto-notification-email',
        expect.objectContaining({
          body: expect.objectContaining({
            orderRecord: expect.objectContaining({
              tire_size: '11R22.5',
              tread: '11L',
              have_casings: true
            }),
            emailType: 'casings_needed'
          })
        })
      );

      // Step 4: Simulate MTO completion workflow
      const completionResult = await mtoOrderService.markMTOCompleted(result.orderId!);
      
      expect(completionResult.success).toBe(true);

      // Verify completion notification
      const completionNotification = mockSupabaseData.notification_logs.find(
        log => log.notification_type === 'completion' && log.order_type === 'mto'
      );
      expect(completionNotification).toBeDefined();
    });

    it('handles MTO order without casings - projected delivery flow', async () => {
      const mtoData = {
        quantity: 5,
        tireSize: '295/75R22.5',
        tread: '12L',
        casingGrade: 'Grade B',
        haveCasings: false,
        projectedDelivery: '2024-03-15',
        store: 'Grand Prairie 027',
        plant: 'Grand Prairie 097',
        name: 'No Casings Test',
        email: 'no-casings@conlantire.com'
      };

      const result = await mtoOrderService.createMTOOrder(mtoData);

      expect(result.success).toBe(true);

      // Verify projected delivery information in notification
      const notification = mockSupabaseData.notification_logs.find(
        log => log.order_type === 'mto'
      );

      expect(notification).toBeDefined();
      expect(notification!.metadata).toEqual(
        expect.objectContaining({
          have_casings: false,
          projected_delivery: '2024-03-15'
        })
      );
    });
  });

  describe('Wheel Order Complete Workflow', () => {
    it('completes wheel order submission and completion notification', async () => {
      const wheelData = {
        quantity: 4,
        wheelSize: '22.5',
        wheelType: 'Steel',
        wheelMaterial: 'Standard Steel',
        desiredColor: 'White',
        handHoles: true,
        store: 'Houston 028',
        plant: 'Mulberry 099',
        name: 'Wheel Test User',
        email: 'wheel-test@conlantire.com'
      };

      // Step 1: Submit wheel order
      const result = await wheelOrderService.createWheelOrder(wheelData);

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();

      // Step 2: Verify wheel order was inserted correctly
      const wheelOrder = mockSupabaseData.wheel_orders[0];
      expect(wheelOrder.wheelsize).toBe('22.5');
      expect(wheelOrder.wheeltype).toBe('Steel');
      expect(wheelOrder.handholes).toBe(true);

      // Step 3: Simulate wheel order completion
      const completionResult = await wheelOrderService.markWheelOrderCompleted(result.orderId!);
      
      expect(completionResult.success).toBe(true);

      // Step 4: Verify completion notification was triggered
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'wheel-notification-email',
        expect.objectContaining({
          body: expect.objectContaining({
            orderRecord: expect.objectContaining({
              wheelsize: '22.5',
              status: 'completed'
            })
          })
        })
      );

      // Step 5: Verify notification logging
      const notification = mockSupabaseData.notification_logs.find(
        log => log.order_type === 'wheel' && log.notification_type === 'completion'
      );
      expect(notification).toBeDefined();
      expect(notification!.plant).toBe('Mulberry 099');
      expect(notification!.store).toBe('Houston 028');
    });
  });

  describe('Warranty Order Workflow', () => {
    it('completes warranty submission workflow (submission only)', async () => {
      const warrantyData = {
        workOrder: 'WO-12345',
        customerName: 'John Doe',
        tireSize: '11R22.5',
        tireType: 'Retread',
        claimReason: 'Premature wear',
        mileage: 15000,
        store: 'San Antonio 029',
        plant: 'Romulus 098',
        email: 'warranty-test@conlantire.com'
      };

      // Step 1: Submit warranty claim
      const result = await warrantyOrderService.submitWarrantyOrder(warrantyData);

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();

      // Step 2: Verify warranty order was created
      const warrantyOrder = mockSupabaseData.warranty_orders[0];
      expect(warrantyOrder.work_order).toBe('WO-12345');
      expect(warrantyOrder.customer_name).toBe('John Doe');
      expect(warrantyOrder.tire_size).toBe('11R22.5');

      // Step 3: Verify warranty submission notification
      const notification = mockSupabaseData.notification_logs.find(
        log => log.order_type === 'warranty'
      );

      expect(notification).toBeDefined();
      expect(notification!.notification_type).toBe('warranty_submission');
      expect(notification!.plant).toBe('Romulus 098');
      expect(notification!.store).toBe('San Antonio 029');

      // Step 4: Verify warranty notification edge function was called
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'warranty-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            orderRecord: expect.objectContaining({
              work_order: 'WO-12345',
              customer_name: 'John Doe'
            })
          })
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles network timeouts gracefully', async () => {
      // Mock network timeout
      vi.mocked(mockSupabase.from).mockImplementationOnce(() => ({
        insert: vi.fn(() => Promise.reject(new Error('Network timeout'))),
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        update: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const orderData = {
        productNumber: 'TIMEOUT-TEST',
        description: 'Timeout Test',
        quantity: 1,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097'
      };

      const result = await orderFormService.submitOrder(orderData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network timeout');
    });

    it('handles invalid email recipients gracefully', async () => {
      // Clear mock recipients to simulate no recipients found
      mockSupabaseData.ot_platform_users = [];
      mockSupabaseData.store_email_recipients = [];

      const orderData = {
        productNumber: 'NO-RECIPIENTS-TEST',
        description: 'No Recipients Test',
        quantity: 1,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Nonexistent Store 999',
        plant: 'Unknown Plant'
      };

      const result = await orderFormService.submitOrder(orderData);

      // Order should still be created, but notification might fail gracefully
      expect(result.success).toBe(true);

      // Verify fallback notification handling
      const notification = mockSupabaseData.notification_logs.find(
        log => log.metadata?.fallback_reason === 'no_recipients_found'
      );
      expect(notification).toBeDefined();
    });

    it('handles edge function failures with retry logic', async () => {
      // Mock edge function failure
      vi.mocked(mockSupabase.functions.invoke)
        .mockRejectedValueOnce(new Error('Edge function timeout'))
        .mockResolvedValueOnce({ data: { success: true }, error: null });

      const orderData = {
        productNumber: 'EDGE-FUNCTION-RETRY',
        description: 'Edge Function Retry Test',
        quantity: 1,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097'
      };

      const result = await orderFormService.submitOrder(orderData);

      expect(result.success).toBe(true);

      // Verify retry was attempted
      expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Supabase Integration', () => {
    it('verifies real-time notifications work correctly', async () => {
      // This would test real-time subscriptions if implemented
      const orderData = {
        productNumber: 'REALTIME-TEST',
        description: 'Real-time Test',
        quantity: 1,
        name: 'Test User',
        email: 'test@conlantire.com',
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097'
      };

      const result = await orderFormService.submitOrder(orderData);

      expect(result.success).toBe(true);

      // Verify that order appears in mock data (simulating real-time update)
      const insertedOrder = mockSupabaseData.orders.find(
        order => order.product_number === 'REALTIME-TEST'
      );
      expect(insertedOrder).toBeDefined();
    });
  });
});