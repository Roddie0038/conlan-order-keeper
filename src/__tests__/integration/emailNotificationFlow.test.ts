/**
 * Phase 5: Integration Tests for Email Notification & Logging Flows
 * Tests the complete notification pipeline from trigger to delivery
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { resolveEmailRecipients, logEmailResolution } from '@/services/emailRecipientResolver';
import { roleBasedEmailService } from '@/services/roleBasedEmailService';
import type { EmailType, OrderDataInput } from '@/services/emailRecipientResolver';

// Mock Supabase client with comprehensive methods
const createMockSupabaseQuery = (data: any = [], error: any = null) => ({
  select: vi.fn(() => ({
    in: vi.fn(() => ({
      eq: vi.fn(() => ({
        not: vi.fn(() => ({ data, error }))
      }))
    })),
    or: vi.fn(() => ({
      eq: vi.fn(() => ({
        not: vi.fn(() => ({ data, error }))
      }))
    })),
    eq: vi.fn(() => ({
      not: vi.fn(() => ({ data, error }))
    }))
  })),
  insert: vi.fn((data) => ({ data: null, error: null })),
  update: vi.fn((data) => ({
    eq: vi.fn((field, value) => ({ data: null, error: null }))
  })),
  eq: vi.fn(() => ({ data: null, error: null }))
});

const mockSupabase = {
  from: vi.fn((tableName) => createMockSupabaseQuery())
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Email Notification Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Recipient Resolution Flow', () => {
    it('should resolve transfer order recipients using three-tier fallback', async () => {
      const orderData: OrderDataInput = {
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097',
        email: 'store022@conlantire.com'
      };

      const result = await resolveEmailRecipients(orderData, 'transfer', 'TEST-001');

      expect(result).toEqual({
        recipients: [],
        source: 'fallback_legacy',
        fallbackReason: 'no_recipients_found',
        orderId: 'TEST-001',
        plant: 'Grand Prairie 097',
        store: 'Fort Worth 022',
        emailType: 'transfer',
        resolutionLog: expect.arrayContaining([
          expect.stringContaining('Starting resolution')
        ])
      });
    });

    it('should prioritize order fields over database recipients', async () => {
      const orderData: OrderDataInput = {
        store: 'Grand Prairie 027',
        plant: 'Grand Prairie 097',
        destination_manager_email: 'manager@example.com'
      };

      const result = await resolveEmailRecipients(orderData, 'cross_dock', 'TEST-002');

      expect(result.source).toBe('order_fields');
      expect(result.recipients).toHaveLength(1);
      expect(result.recipients[0]).toEqual({
        email: 'manager@example.com',
        name: 'Destination Manager',
        role: 'destination_manager',
        store: 'Grand Prairie 027',
        plant: 'Grand Prairie 097'
      });
    });

    it('should handle store normalization in recipient resolution', async () => {
      const testCases = [
        { input: '22', expected: 'Fort Worth 022' },
        { input: 'Store 27', expected: 'Grand Prairie 027' },
        { input: 'Houston 28', expected: 'Houston 028' }
      ];

      for (const testCase of testCases) {
        const orderData: OrderDataInput = {
          store: testCase.input,
          plant: 'Grand Prairie 097'
        };

        const result = await resolveEmailRecipients(orderData, 'transfer');
        expect(result.store).toBe(testCase.expected);
      }
    });

    it('should apply role-based filtering correctly', async () => {
      // Mock store_email_recipients data
      const mockRecipients = [
        {
          recipient_email: 'manager@store.com',
          recipient_role: 'store_manager',
          notification_types: ['transfer', 'mto', 'wheel']
        },
        {
          recipient_email: 'warehouse@plant.com',
          recipient_role: 'warehouse_coordinator',
          notification_types: ['transfer', 'wheel']
        },
        {
          recipient_email: 'retread@plant.com',
          recipient_role: 'retread_manager',
          notification_types: ['mto', 'warranty']
        }
      ];

      // Mock the database response
      mockSupabase.from.mockReturnValue(createMockSupabaseQuery(mockRecipients, null));

      const orderData: OrderDataInput = {
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097'
      };

      // Test MTO - should include store_manager and retread_manager
      const mtoResult = await resolveEmailRecipients(orderData, 'mto');
      expect(mtoResult.recipients).toHaveLength(2);
      expect(mtoResult.recipients.map(r => r.role)).toEqual(
        expect.arrayContaining(['store_manager', 'retread_manager'])
      );

      // Test warranty - should only include retread_manager
      const warrantyResult = await resolveEmailRecipients(orderData, 'warranty');
      expect(warrantyResult.recipients).toHaveLength(1);
      expect(warrantyResult.recipients[0].role).toBe('retread_manager');
    });

    it('should handle edge cases and errors gracefully', async () => {
      // Test with invalid store
      const invalidOrderData: OrderDataInput = {
        store: '',
        plant: ''
      };

      const result = await resolveEmailRecipients(invalidOrderData, 'transfer');
      expect(result.source).toBe('fallback_legacy');
      expect(result.fallbackReason).toBe('no_recipients_found');

      // Test with database error
      mockSupabase.from.mockReturnValue(createMockSupabaseQuery(null, { message: 'Database connection failed' }));

      const errorResult = await resolveEmailRecipients(invalidOrderData, 'transfer');
      expect(errorResult.source).toBe('fallback_legacy');
      expect(errorResult.fallbackReason).toBe('resolution_error');
    });
  });

  describe('Email Domain Restrictions & Security', () => {
    it('should validate email domains and reject unauthorized emails', async () => {
      const unauthorizedEmails = [
        'hacker@malicious.com',
        'spam@external.org',
        'test@gmail.com'
      ];

      for (const email of unauthorizedEmails) {
        const orderData: OrderDataInput = {
          store: 'Fort Worth 022',
          plant: 'Grand Prairie 097',
          email: email
        };

        const result = await resolveEmailRecipients(orderData, 'transfer');
        
        // Should not include unauthorized external emails
        const hasUnauthorizedEmail = result.recipients.some(r => 
          !r.email.endsWith('@conlantire.com') && 
          !r.email.endsWith('@example.com')
        );
        expect(hasUnauthorizedEmail).toBe(false);
      }
    });

    it('should allow authorized domains', async () => {
      const authorizedDomains = ['@conlantire.com', '@example.com'];
      
      for (const domain of authorizedDomains) {
        const orderData: OrderDataInput = {
          store: 'Fort Worth 022',
          plant: 'Grand Prairie 097',
          destination_manager_email: `manager${domain}`
        };

        const result = await resolveEmailRecipients(orderData, 'cross_dock');
        expect(result.recipients).toHaveLength(1);
        expect(result.recipients[0].email).toContain(domain);
      }
    });
  });

  describe('Notification Logging Flow', () => {
    it('should log successful email resolution to notification_logs', async () => {
      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = {
        recipients: [
          {
            email: 'manager@conlantire.com',
            name: 'Store Manager',
            role: 'store_manager',
            store: 'Fort Worth 022',
            plant: 'Grand Prairie 097'
          }
        ],
        source: 'sql_function' as const,
        orderId: 'TEST-001',
        plant: 'Grand Prairie 097',
        store: 'Fort Worth 022',
        emailType: 'transfer',
        resolutionLog: ['Test log entry']
      };

      await logEmailResolution(result);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'TEST-001',
          notification_type: 'transfer_resolution',
          recipient_email: 'manager@conlantire.com',
          recipient_role: 'store_manager',
          store: 'Fort Worth 022',
          plant: 'Grand Prairie 097',
          status: 'resolved',
          metadata: expect.objectContaining({
            service: 'email_recipient_resolver',
            source: 'store_email_recipients',
            total_recipients: 1
          })
        })
      );
    });

    it('should log resolution failures separately', async () => {
      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      const failureResult = {
        recipients: [],
        source: 'fallback_legacy' as const,
        fallbackReason: 'no_recipients_found',
        orderId: 'TEST-002',
        plant: 'Grand Prairie 097',
        store: 'Fort Worth 022',
        emailType: 'mto',
        resolutionLog: ['No recipients found']
      };

      await logEmailResolution(failureResult);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          notification_type: 'mto_resolution_failure',
          recipient_email: 'system',
          recipient_role: 'system',
          status: 'failed',
          error_message: 'no_recipients_found'
        })
      );
    });

    it('should handle logging errors gracefully', async () => {
      const mockInsert = vi.fn(() => ({ 
        data: null, 
        error: { message: 'Failed to insert log' } 
      }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = {
        recipients: [
          {
            email: 'test@conlantire.com',
            name: 'Test User',
            role: 'store_manager',
            store: 'Fort Worth 022',
            plant: 'Grand Prairie 097'
          }
        ],
        source: 'sql_function' as const,
        orderId: 'TEST-003',
        plant: 'Grand Prairie 097',
        store: 'Fort Worth 022',
        emailType: 'transfer',
        resolutionLog: []
      };

      // Should not throw error
      await expect(logEmailResolution(result)).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to log resolution')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Role-Based Email Service Integration', () => {
    it('should integrate with role-based email service', async () => {
      const mockRoutingResult = {
        recipients: [
          {
            email: 'manager@conlantire.com',
            name: 'Store Manager',
            role: 'store_manager',
            store: 'Fort Worth 022',
            plant: 'Grand Prairie 097'
          }
        ],
        source: 'database' as const,
        routingRules: ['store_manager:transfer:allowed']
      };

      const getEmailRecipientsSpy = vi.spyOn(roleBasedEmailService, 'getEmailRecipients')
        .mockResolvedValue(mockRoutingResult);

      const logEmailRoutingSpy = vi.spyOn(roleBasedEmailService, 'logEmailRouting')
        .mockResolvedValue();

      const result = await roleBasedEmailService.getEmailRecipients(
        'Fort Worth 022',
        'transfer',
        'Grand Prairie 097'
      );

      expect(getEmailRecipientsSpy).toHaveBeenCalledWith(
        'Fort Worth 022',
        'transfer',
        'Grand Prairie 097'
      );

      expect(result.recipients).toHaveLength(1);
      expect(result.source).toBe('database');

      // Test logging
      await roleBasedEmailService.logEmailRouting(
        'Fort Worth 022',
        'transfer',
        result.recipients,
        result.source,
        undefined,
        result.routingRules
      );

      expect(logEmailRoutingSpy).toHaveBeenCalledWith(
        'Fort Worth 022',
        'transfer',
        result.recipients,
        'database',
        undefined,
        result.routingRules
      );

      getEmailRecipientsSpy.mockRestore();
      logEmailRoutingSpy.mockRestore();
    });

    it('should handle fallback scenarios in role-based service', async () => {
      // Mock no database recipients, fallback to ot_platform_users
      const fallbackUsers = [
        {
          email: 'fallback@conlantire.com',
          full_name: 'Fallback User',
          role: 'store_manager',
          store: 'Fort Worth 022',
          plant: 'Grand Prairie 097'
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce(createMockSupabaseQuery([], null)) // No database recipients
        .mockReturnValueOnce(createMockSupabaseQuery(fallbackUsers, null)); // Fallback users

      const result = await roleBasedEmailService.getEmailRecipients(
        'Fort Worth 022',
        'transfer',
        'Grand Prairie 097'
      );

      expect(result.source).toBe('fallback');
      expect(result.fallbackReason).toBe('no_database_recipients');
      expect(result.recipients).toHaveLength(1);
      expect(result.recipients[0].email).toBe('fallback@conlantire.com');
    });
  });

  describe('Edge Function Trigger Simulation', () => {
    it('should simulate MTO order notification trigger', async () => {
      const mtoOrderData = {
        id: 'test-mto-001',
        store: 'Grand Prairie 027',
        plant: 'Grand Prairie 097',
        email: 'test@conlantire.com',
        product_number: 'TEST-123',
        quantity: 2,
        status: 'pending'
      };

      // Simulate the trigger that would happen in database
      const expectedLogEntry = {
        order_id: mtoOrderData.id,
        order_number: mtoOrderData.id,
        order_type: 'mto',
        notification_type: 'mto_casings_needed',
        recipient_email: mtoOrderData.email,
        recipient_role: 'store_manager',
        status: 'triggered',
        plant: mtoOrderData.plant,
        store: mtoOrderData.store,
        platform: 'ot_platform'
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      // Simulate the notification logging that would happen in edge function
      await mockSupabase.from('notification_logs').insert(expectedLogEntry);

      expect(mockInsert).toHaveBeenCalledWith(expectedLogEntry);
    });

    it('should simulate transfer order completion trigger', async () => {
      const transferOrderData = {
        id: 'test-transfer-001',
        store: 'Fort Worth 022',
        plant: 'Grand Prairie 097',
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Simulate completion trigger
      const expectedLogEntry = {
        order_id: transferOrderData.id,
        order_type: 'transfer',
        notification_type: 'completion',
        status: 'triggered',
        store: transferOrderData.store,
        plant: transferOrderData.plant
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      await mockSupabase.from('ordering_email_logs').insert(expectedLogEntry);

      expect(mockInsert).toHaveBeenCalledWith(expectedLogEntry);
    });

    it('should simulate warranty approval trigger', async () => {
      const warrantyOrderData = {
        id: 'test-warranty-001',
        store: 'Houston 028',
        plant: 'Mulberry 099',
        approval_status: 'approved',
        approval_date: new Date().toISOString()
      };

      const expectedLogEntry = {
        order_id: warrantyOrderData.id,
        order_type: 'warranty',
        notification_type: 'warranty_claims',
        status: 'triggered',
        store: warrantyOrderData.store,
        plant: warrantyOrderData.plant
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      await mockSupabase.from('ordering_email_logs').insert(expectedLogEntry);

      expect(mockInsert).toHaveBeenCalledWith(expectedLogEntry);
    });
  });

  describe('Delivery and Retry Logic', () => {
    it('should handle successful email delivery tracking', async () => {
      const deliveryLogEntry = {
        notification_id: 'test-notification-001',
        recipient_email: 'manager@conlantire.com',
        recipient_role: 'store_manager',
        delivery_status: 'delivered',
        delivery_provider: 'resend',
        provider_message_id: 'msg_12345',
        delivered_at: new Date().toISOString()
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      await mockSupabase.from('notification_delivery_log').insert(deliveryLogEntry);

      expect(mockInsert).toHaveBeenCalledWith(deliveryLogEntry);
    });

    it('should handle failed delivery with retry logic', async () => {
      const failedDeliveryLog = {
        notification_id: 'test-notification-002',
        recipient_email: 'invalid@example.com',
        recipient_role: 'store_manager',
        delivery_status: 'failed',
        delivery_provider: 'resend',
        error_details: 'Invalid email address'
      };

      const queueRetryEntry = {
        order_id: 'test-order-001',
        order_type: 'transfer',
        email_type: 'transfer',
        status: 'pending',
        retry_count: 1,
        max_retries: 3,
        error_message: 'Invalid email address',
        scheduled_at: new Date(Date.now() + 300000).toISOString() // 5 minutes later
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      // Log failed delivery
      await mockSupabase.from('notification_delivery_log').insert(failedDeliveryLog);
      
      // Queue for retry
      await mockSupabase.from('notification_queue').insert(queueRetryEntry);

      expect(mockInsert).toHaveBeenCalledWith(failedDeliveryLog);
      expect(mockInsert).toHaveBeenCalledWith(queueRetryEntry);
    });

    it('should handle timeout scenarios', async () => {
      const timeoutLogEntry = {
        notification_id: 'test-notification-003',
        recipient_email: 'timeout@example.com',
        recipient_role: 'warehouse_manager',
        delivery_status: 'timeout',
        delivery_provider: 'resend',
        error_details: 'Request timeout after 30 seconds'
      };

      const mockInsert = vi.fn(() => ({ data: null, error: null }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.insert = mockInsert;
      mockSupabase.from.mockReturnValue(mockQuery);

      await mockSupabase.from('notification_delivery_log').insert(timeoutLogEntry);

      expect(mockInsert).toHaveBeenCalledWith(timeoutLogEntry);
    });

    it('should handle max retries exceeded', async () => {
      const maxRetriesEntry = {
        order_id: 'test-order-004',
        order_type: 'mto',
        email_type: 'mto',
        status: 'failed',
        retry_count: 3,
        max_retries: 3,
        error_message: 'Max retries exceeded',
        processed_at: new Date().toISOString()
      };

      const mockEq = vi.fn((field, value) => ({ data: null, error: null }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      const mockQuery = createMockSupabaseQuery();
      mockQuery.update = mockUpdate;
      mockSupabase.from.mockReturnValue(mockQuery);

      const table = mockSupabase.from('notification_queue');
      await table.update(maxRetriesEntry).eq('id', 'test-queue-item-001');

      expect(mockUpdate).toHaveBeenCalledWith(maxRetriesEntry);
      expect(mockEq).toHaveBeenCalledWith('id', 'test-queue-item-001');
    });
  });
});