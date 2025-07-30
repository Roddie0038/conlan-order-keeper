/**
 * OrderIDService - Centralized Order ID Management for Ordering Platform
 * 
 * Provides consistent, readable Order ID formatting across all order types with:
 * - Standardized UUID-based IDs with readable prefixes
 * - Helper methods for formatting, parsing, and validation
 * - Migration utilities for existing orders
 * 
 * Prefix Conventions:
 * - ORD- : Transfer Orders
 * - MTO- : Make-To-Order
 * - WHL- : Wheel Powder Coating Orders
 * - WAR- : Warranty Orders
 */

export type OrderType = 'TRANSFER' | 'MTO' | 'WHEEL_POWDER_COATING' | 'WARRANTY';

export interface OrderIDComponents {
  prefix: string;
  uuid: string;
  fullId: string;
}

export class OrderIDService {
  // Order type to prefix mapping
  private static readonly ORDER_PREFIXES: Record<OrderType, string> = {
    TRANSFER: 'ORD',
    MTO: 'MTO',
    WHEEL_POWDER_COATING: 'WHL',
    WARRANTY: 'WAR'
  };

  // Reverse mapping for parsing
  private static readonly PREFIX_TO_TYPE: Record<string, OrderType> = {
    ORD: 'TRANSFER',
    MTO: 'MTO',
    WHL: 'WHEEL_POWDER_COATING',
    WAR: 'WARRANTY'
  };

  /**
   * Generate a new standardized order ID with readable prefix
   */
  static generateOrderID(orderType: OrderType): string {
    const prefix = this.ORDER_PREFIXES[orderType];
    const uuid = crypto.randomUUID();
    return `${prefix}-${uuid}`;
  }

  /**
   * Parse an order ID to extract components
   */
  static parseOrderID(orderId: string): OrderIDComponents | null {
    const idPattern = /^(ORD|MTO|WHL|WAR)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    const match = orderId.match(idPattern);
    
    if (!match) {
      return null;
    }

    const [fullId, prefix, uuid] = match;
    return {
      prefix,
      uuid,
      fullId: orderId
    };
  }

  /**
   * Validate if an order ID follows the standardized format
   */
  static isValidOrderID(orderId: string): boolean {
    return this.parseOrderID(orderId) !== null;
  }

  /**
   * Get order type from an order ID
   */
  static getOrderType(orderId: string): OrderType | null {
    const components = this.parseOrderID(orderId);
    if (!components) {
      return null;
    }
    return this.PREFIX_TO_TYPE[components.prefix.toUpperCase()] || null;
  }

  /**
   * Extract UUID from a standardized order ID
   */
  static extractUUID(orderId: string): string | null {
    const components = this.parseOrderID(orderId);
    return components?.uuid || null;
  }

  /**
   * Format a raw UUID with appropriate prefix based on order type
   */
  static formatWithPrefix(uuid: string, orderType: OrderType): string {
    const prefix = this.ORDER_PREFIXES[orderType];
    return `${prefix}-${uuid}`;
  }

  /**
   * Migration utility: Convert legacy order IDs to new format
   * Used when migrating existing orders to the new ID standard
   */
  static migrateLegacyID(legacyId: string, orderType: OrderType): string {
    // If already in new format, return as-is
    if (this.isValidOrderID(legacyId)) {
      return legacyId;
    }

    // If it's a raw UUID, add prefix
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(legacyId)) {
      return this.formatWithPrefix(legacyId, orderType);
    }

    // For other legacy formats, generate a new ID and log the migration
    console.warn(`OrderIDService: Migrating legacy ID "${legacyId}" to new format for ${orderType}`);
    return this.generateOrderID(orderType);
  }

  /**
   * Batch migration utility for multiple orders
   */
  static migrateBatch(orders: Array<{ id: string; type: OrderType }>): Record<string, string> {
    const migrations: Record<string, string> = {};
    
    orders.forEach(order => {
      const newId = this.migrateLegacyID(order.id, order.type);
      if (newId !== order.id) {
        migrations[order.id] = newId;
      }
    });

    return migrations;
  }

  /**
   * Display-friendly order ID formatting
   * Adds spacing and formatting for UI display
   */
  static formatForDisplay(orderId: string): string {
    const components = this.parseOrderID(orderId);
    if (!components) {
      return orderId; // Return as-is if not in standard format
    }

    // Format as "ORD - 12345678-1234-1234-1234-123456789012"
    return `${components.prefix} - ${components.uuid}`;
  }

  /**
   * Generate a short reference ID for display in UI
   * Takes first 8 characters of UUID with prefix
   */
  static generateShortReference(orderId: string): string {
    const components = this.parseOrderID(orderId);
    if (!components) {
      return orderId.substring(0, 12); // Fallback for legacy IDs
    }

    const shortUuid = components.uuid.substring(0, 8);
    return `${components.prefix}-${shortUuid}`;
  }

  /**
   * Validate order ID collection for consistency
   * Useful for validating existing order data
   */
  static validateOrderCollection(orders: Array<{ id: string; type?: OrderType }>): {
    valid: Array<{ id: string; type: OrderType }>;
    invalid: Array<{ id: string; reason: string }>;
    needsMigration: Array<{ id: string; type: OrderType; suggestedId: string }>;
  } {
    const valid: Array<{ id: string; type: OrderType }> = [];
    const invalid: Array<{ id: string; reason: string }> = [];
    const needsMigration: Array<{ id: string; type: OrderType; suggestedId: string }> = [];

    orders.forEach(order => {
      if (!order.type) {
        invalid.push({ id: order.id, reason: 'Missing order type' });
        return;
      }

      if (this.isValidOrderID(order.id)) {
        const detectedType = this.getOrderType(order.id);
        if (detectedType === order.type) {
          valid.push({ id: order.id, type: order.type });
        } else {
          invalid.push({ 
            id: order.id, 
            reason: `Type mismatch: ID suggests ${detectedType}, declared as ${order.type}` 
          });
        }
      } else {
        const suggestedId = this.migrateLegacyID(order.id, order.type);
        needsMigration.push({ 
          id: order.id, 
          type: order.type, 
          suggestedId 
        });
      }
    });

    return { valid, invalid, needsMigration };
  }

  /**
   * Get all supported order types
   */
  static getSupportedOrderTypes(): OrderType[] {
    return Object.keys(this.ORDER_PREFIXES) as OrderType[];
  }

  /**
   * Get prefix for a given order type
   */
  static getPrefix(orderType: OrderType): string {
    return this.ORDER_PREFIXES[orderType];
  }
}

export default OrderIDService;