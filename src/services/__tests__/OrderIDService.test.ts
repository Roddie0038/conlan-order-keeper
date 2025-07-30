import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrderIDService, { OrderType } from '../OrderIDService'

describe('OrderIDService', () => {
  beforeEach(() => {
    // Reset crypto mock for each test
    vi.mocked(crypto.randomUUID).mockReturnValue('12345678-1234-1234-1234-123456789012')
  })

  describe('generateOrderID', () => {
    it('should generate order ID with correct prefix for each order type', () => {
      expect(OrderIDService.generateOrderID('TRANSFER')).toBe('ORD-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.generateOrderID('MTO')).toBe('MTO-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.generateOrderID('WHEEL_POWDER_COATING')).toBe('WHL-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.generateOrderID('WARRANTY')).toBe('WAR-12345678-1234-1234-1234-123456789012')
    })

    it('should generate unique IDs for multiple calls', () => {
      vi.mocked(crypto.randomUUID)
        .mockReturnValueOnce('11111111-1111-1111-1111-111111111111')
        .mockReturnValueOnce('22222222-2222-2222-2222-222222222222')

      const id1 = OrderIDService.generateOrderID('TRANSFER')
      const id2 = OrderIDService.generateOrderID('TRANSFER')

      expect(id1).toBe('ORD-11111111-1111-1111-1111-111111111111')
      expect(id2).toBe('ORD-22222222-2222-2222-2222-222222222222')
      expect(id1).not.toBe(id2)
    })
  })

  describe('parseOrderID', () => {
    it('should parse valid order IDs correctly', () => {
      const orderId = 'ORD-12345678-1234-1234-1234-123456789012'
      const result = OrderIDService.parseOrderID(orderId)

      expect(result).toEqual({
        prefix: 'ORD',
        uuid: '12345678-1234-1234-1234-123456789012',
        fullId: orderId
      })
    })

    it('should parse all order type prefixes', () => {
      const testCases = [
        { orderId: 'MTO-12345678-1234-1234-1234-123456789012', prefix: 'MTO' },
        { orderId: 'WHL-12345678-1234-1234-1234-123456789012', prefix: 'WHL' },
        { orderId: 'WAR-12345678-1234-1234-1234-123456789012', prefix: 'WAR' }
      ]

      testCases.forEach(({ orderId, prefix }) => {
        const result = OrderIDService.parseOrderID(orderId)
        expect(result?.prefix).toBe(prefix)
      })
    })

    it('should handle case insensitive parsing', () => {
      const orderId = 'ord-12345678-1234-1234-1234-123456789012'
      const result = OrderIDService.parseOrderID(orderId)

      expect(result).not.toBeNull()
      expect(result?.prefix).toBe('ord')
    })

    it('should return null for invalid formats', () => {
      const invalidIds = [
        'invalid-id',
        'ORD-invalid-uuid',
        '12345678-1234-1234-1234-123456789012',
        'XYZ-12345678-1234-1234-1234-123456789012',
        'ORD_12345678-1234-1234-1234-123456789012'
      ]

      invalidIds.forEach(id => {
        expect(OrderIDService.parseOrderID(id)).toBeNull()
      })
    })
  })

  describe('isValidOrderID', () => {
    it('should validate correct order ID formats', () => {
      const validIds = [
        'ORD-12345678-1234-1234-1234-123456789012',
        'MTO-12345678-1234-1234-1234-123456789012',
        'WHL-12345678-1234-1234-1234-123456789012',
        'WAR-12345678-1234-1234-1234-123456789012'
      ]

      validIds.forEach(id => {
        expect(OrderIDService.isValidOrderID(id)).toBe(true)
      })
    })

    it('should reject invalid order ID formats', () => {
      const invalidIds = [
        'invalid-id',
        'ORD-invalid',
        '12345678-1234-1234-1234-123456789012',
        'XYZ-12345678-1234-1234-1234-123456789012'
      ]

      invalidIds.forEach(id => {
        expect(OrderIDService.isValidOrderID(id)).toBe(false)
      })
    })
  })

  describe('getOrderType', () => {
    it('should return correct order types for valid IDs', () => {
      expect(OrderIDService.getOrderType('ORD-12345678-1234-1234-1234-123456789012')).toBe('TRANSFER')
      expect(OrderIDService.getOrderType('MTO-12345678-1234-1234-1234-123456789012')).toBe('MTO')
      expect(OrderIDService.getOrderType('WHL-12345678-1234-1234-1234-123456789012')).toBe('WHEEL_POWDER_COATING')
      expect(OrderIDService.getOrderType('WAR-12345678-1234-1234-1234-123456789012')).toBe('WARRANTY')
    })

    it('should return null for invalid IDs', () => {
      expect(OrderIDService.getOrderType('invalid-id')).toBeNull()
      expect(OrderIDService.getOrderType('XYZ-12345678-1234-1234-1234-123456789012')).toBeNull()
    })
  })

  describe('extractUUID', () => {
    it('should extract UUID from valid order IDs', () => {
      const orderId = 'ORD-12345678-1234-1234-1234-123456789012'
      const uuid = OrderIDService.extractUUID(orderId)
      
      expect(uuid).toBe('12345678-1234-1234-1234-123456789012')
    })

    it('should return null for invalid order IDs', () => {
      expect(OrderIDService.extractUUID('invalid-id')).toBeNull()
    })
  })

  describe('formatWithPrefix', () => {
    it('should format UUID with correct prefix', () => {
      const uuid = '12345678-1234-1234-1234-123456789012'
      
      expect(OrderIDService.formatWithPrefix(uuid, 'TRANSFER')).toBe('ORD-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.formatWithPrefix(uuid, 'MTO')).toBe('MTO-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.formatWithPrefix(uuid, 'WHEEL_POWDER_COATING')).toBe('WHL-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.formatWithPrefix(uuid, 'WARRANTY')).toBe('WAR-12345678-1234-1234-1234-123456789012')
    })
  })

  describe('migrateLegacyID', () => {
    it('should return existing valid order IDs unchanged', () => {
      const validId = 'ORD-12345678-1234-1234-1234-123456789012'
      expect(OrderIDService.migrateLegacyID(validId, 'TRANSFER')).toBe(validId)
    })

    it('should add prefix to raw UUIDs', () => {
      const rawUuid = '12345678-1234-1234-1234-123456789012'
      expect(OrderIDService.migrateLegacyID(rawUuid, 'TRANSFER')).toBe('ORD-12345678-1234-1234-1234-123456789012')
    })

    it('should generate new ID for unknown legacy formats', () => {
      const legacyId = 'old-format-123'
      const result = OrderIDService.migrateLegacyID(legacyId, 'TRANSFER')
      
      expect(result).toBe('ORD-12345678-1234-1234-1234-123456789012')
      expect(OrderIDService.isValidOrderID(result)).toBe(true)
    })
  })

  describe('migrateBatch', () => {
    it('should migrate multiple orders and return mapping', () => {
      const orders = [
        { id: 'ORD-12345678-1234-1234-1234-123456789012', type: 'TRANSFER' as OrderType },
        { id: '87654321-4321-4321-4321-210987654321', type: 'MTO' as OrderType },
        { id: 'legacy-123', type: 'WHEEL_POWDER_COATING' as OrderType }
      ]

      vi.mocked(crypto.randomUUID)
        .mockReturnValueOnce('87654321-4321-4321-4321-210987654321')
        .mockReturnValueOnce('99999999-9999-9999-9999-999999999999')

      const migrations = OrderIDService.migrateBatch(orders)

      expect(migrations).toEqual({
        '87654321-4321-4321-4321-210987654321': 'MTO-87654321-4321-4321-4321-210987654321',
        'legacy-123': 'WHL-99999999-9999-9999-9999-999999999999'
      })
    })
  })

  describe('formatForDisplay', () => {
    it('should format valid order IDs for display', () => {
      const orderId = 'ORD-12345678-1234-1234-1234-123456789012'
      expect(OrderIDService.formatForDisplay(orderId)).toBe('ORD - 12345678-1234-1234-1234-123456789012')
    })

    it('should return original for invalid formats', () => {
      const invalidId = 'invalid-format'
      expect(OrderIDService.formatForDisplay(invalidId)).toBe(invalidId)
    })
  })

  describe('generateShortReference', () => {
    it('should generate short reference from valid order ID', () => {
      const orderId = 'ORD-12345678-1234-1234-1234-123456789012'
      expect(OrderIDService.generateShortReference(orderId)).toBe('ORD-12345678')
    })

    it('should truncate invalid IDs', () => {
      const invalidId = 'this-is-a-very-long-invalid-id-format'
      expect(OrderIDService.generateShortReference(invalidId)).toBe('this-is-a-ve')
    })
  })

  describe('validateOrderCollection', () => {
    it('should categorize orders correctly', () => {
      const orders = [
        { id: 'ORD-12345678-1234-1234-1234-123456789012', type: 'TRANSFER' as OrderType },
        { id: 'MTO-87654321-4321-4321-4321-210987654321', type: 'WHEEL_POWDER_COATING' as OrderType }, // Type mismatch
        { id: '11111111-1111-1111-1111-111111111111', type: 'MTO' as OrderType }, // Needs migration
        { id: 'invalid-format', type: 'WARRANTY' as OrderType }, // Needs migration
        { id: 'some-id' } // Missing type
      ]

      vi.mocked(crypto.randomUUID)
        .mockReturnValueOnce('22222222-2222-2222-2222-222222222222')
        .mockReturnValueOnce('33333333-3333-3333-3333-333333333333')

      const result = OrderIDService.validateOrderCollection(orders)

      expect(result.valid).toHaveLength(1)
      expect(result.valid[0].id).toBe('ORD-12345678-1234-1234-1234-123456789012')

      expect(result.invalid).toHaveLength(2)
      expect(result.invalid[0].reason).toBe('Type mismatch: ID suggests MTO, declared as WHEEL_POWDER_COATING')
      expect(result.invalid[1].reason).toBe('Missing order type')

      expect(result.needsMigration).toHaveLength(2)
      expect(result.needsMigration[0].suggestedId).toBe('MTO-11111111-1111-1111-1111-111111111111')
      expect(result.needsMigration[1].suggestedId).toBe('WAR-33333333-3333-3333-3333-333333333333')
    })
  })

  describe('utility methods', () => {
    it('should return all supported order types', () => {
      const types = OrderIDService.getSupportedOrderTypes()
      expect(types).toEqual(['TRANSFER', 'MTO', 'WHEEL_POWDER_COATING', 'WARRANTY'])
    })

    it('should return correct prefix for order types', () => {
      expect(OrderIDService.getPrefix('TRANSFER')).toBe('ORD')
      expect(OrderIDService.getPrefix('MTO')).toBe('MTO')
      expect(OrderIDService.getPrefix('WHEEL_POWDER_COATING')).toBe('WHL')
      expect(OrderIDService.getPrefix('WARRANTY')).toBe('WAR')
    })
  })
})