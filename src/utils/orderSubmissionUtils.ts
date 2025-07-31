/**
 * Phase 3: Simplified Order Submission Utility  
 * Replaces unifiedOrderService with minimal required functions
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { errorHandler, ErrorType } from '@/utils/errorHandler';
import type { OrderRecord, MTOOrderRecord, WheelOrderRecord } from '@/types/orders';

/**
 * Submit order to Supabase with error handling
 */
export async function submitOrder(
  orderData: Partial<OrderRecord>,
  orderType: 'transfer' | 'mto' | 'wheel' | 'warranty' = 'transfer'
) {
  logger.info('Submitting order', { orderType, service: 'order_submission' });

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Order submitted successfully', { 
      orderId: data.id, 
      orderType, 
      service: 'order_submission' 
    });

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'order_submission', 
      orderType 
    });
  }
}

/**
 * Submit MTO order to Supabase with error handling
 */
export async function submitMTOOrder(orderData: Partial<MTOOrderRecord>) {
  logger.info('Submitting MTO order', { service: 'mto_submission' });

  try {
    const { data, error } = await supabase
      .from('mto_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('MTO order submitted successfully', { 
      orderId: data.id, 
      service: 'mto_submission' 
    });

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'mto_submission' 
    });
  }
}

/**
 * Submit wheel order to Supabase with error handling
 */
export async function submitWheelOrder(orderData: Partial<WheelOrderRecord>) {
  logger.info('Submitting wheel order', { service: 'wheel_submission' });

  try {
    const { data, error } = await supabase
      .from('wheel_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Wheel order submitted successfully', { 
      orderId: data.id, 
      service: 'wheel_submission' 
    });

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'wheel_submission' 
    });
  }
}