/**
 * Phase 3: Simplified Order Submission Utility  
 * Replaces unifiedOrderService with minimal required functions
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { errorHandler, ErrorType } from '@/utils/errorHandler';
import type { OrderRecord, MTOOrderRecord, WheelOrderRecord } from '@/types/orders';
import { isElevated } from '@/server/access/elevated';
import { getCurrentUser } from '@/server/auth/getUser';
import { baseOrderSchema, scrubCrossPlantForNonElevated, assertCrossPlantConsistency } from '@/server/validators/order';
import { auditCrossPlant } from '@/server/audit/crossplant';

export async function submitOrder(
  orderData: any,
  orderType: 'transfer' | 'mto' | 'wheel' | 'warranty' = 'transfer'
) {
  logger.info('Submitting order', { orderType, service: 'order_submission' });

  try {
    // Get current user for role-based validation
    const user = await getCurrentUser();
    const elevated = isElevated(user);
    
    logger.info('Order submission access check', { 
      elevated, 
      userEmail: user.email, 
      userRole: user.role, 
      service: 'order_submission' 
    });

    // Ensure required fields are present
    let submissionData = {
      ...orderData,
      timestamp: orderData.timestamp || new Date().toISOString(),
      id: undefined // Let Supabase generate the ID
    };

    // Validate and scrub cross-plant fields for non-elevated users
    if (!elevated) {
      submissionData = scrubCrossPlantForNonElevated(submissionData);
      logger.info('Cross-plant fields scrubbed for non-elevated user', { 
        userEmail: user.email, 
        service: 'order_submission' 
      });
    } else {
      // For elevated users, validate cross-plant consistency
      try {
        assertCrossPlantConsistency(submissionData);
        logger.info('Cross-plant validation passed for elevated user', { 
          userEmail: user.email, 
          service: 'order_submission' 
        });
      } catch (validationError: any) {
        logger.error('Cross-plant validation failed', { 
          error: validationError.message, 
          userEmail: user.email, 
          service: 'order_submission' 
        });
        throw validationError;
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const usedCrossPlant = !!((submissionData as any).ordering_store || (submissionData as any).ordering_plant || (submissionData as any).destination_plant);
    
    // Breadcrumb for dev tools
    console.info('[orders] submitted', {
      id: data?.id,
      elevated,
      cp: usedCrossPlant,
    });

    logger.info('Order submitted successfully', { 
      orderId: data?.id?.toString() || 'unknown', 
      orderType, 
      elevated,
      hasCrossPlantFields: usedCrossPlant,
      service: 'order_submission' 
    });

    // Fire-and-forget audit (don't block UX)
    if (usedCrossPlant) {
      auditCrossPlant({
        order_type: 'order',
        order_id: data?.id ? Number(data.id) : null,
        user_email: user.email,
        user_role: user.role,
        ordering_store: (submissionData as any).ordering_store ?? null,
        ordering_plant: (submissionData as any).ordering_plant ?? null,
        destination_plant: (submissionData as any).destination_plant ?? null,
        destination_store: (submissionData as any).store ?? null,
        meta: { ui: 'OrderForm', elevated: elevated ?? false },
      });
    }

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'order_submission', 
      orderType 
    });
  }
}

export async function submitMTOOrder(orderData: any) {
  logger.info('Submitting MTO order', { service: 'mto_submission' });

  try {
    // Get current user for role-based validation
    const user = await getCurrentUser();
    const elevated = isElevated(user);
    
    logger.info('MTO order submission access check', { 
      elevated, 
      userEmail: user.email, 
      userRole: user.role, 
      service: 'mto_submission' 
    });

    let submissionData = { ...orderData };

    // Validate and scrub cross-plant fields for non-elevated users
    if (!elevated) {
      submissionData = scrubCrossPlantForNonElevated(submissionData);
      logger.info('Cross-plant fields scrubbed for non-elevated MTO user', { 
        userEmail: user.email, 
        service: 'mto_submission' 
      });
    } else {
      // For elevated users, validate cross-plant consistency
      try {
        assertCrossPlantConsistency(submissionData);
        logger.info('Cross-plant validation passed for elevated MTO user', { 
          userEmail: user.email, 
          service: 'mto_submission' 
        });
      } catch (validationError: any) {
        logger.error('Cross-plant validation failed for MTO', { 
          error: validationError.message, 
          userEmail: user.email, 
          service: 'mto_submission' 
        });
        throw validationError;
      }
    }

    const { data, error } = await supabase
      .from('mto_orders')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const usedCrossPlant = !!((submissionData as any).ordering_store || (submissionData as any).ordering_plant || (submissionData as any).destination_plant);

    // Breadcrumb for dev tools
    console.info('[mto_orders] submitted', {
      id: data?.id,
      elevated,
      cp: usedCrossPlant,
    });

    logger.info('MTO order submitted successfully', { 
      orderId: data.id, 
      elevated,
      hasCrossPlantFields: usedCrossPlant,
      service: 'mto_submission' 
    });

    // Fire-and-forget audit (don't block UX)
    if (usedCrossPlant) {
      auditCrossPlant({
        order_type: 'mto',
        order_id: data?.id ? Number(data.id) : null,
        user_email: user.email,
        user_role: user.role,
        ordering_store: (submissionData as any).ordering_store ?? null,
        ordering_plant: (submissionData as any).ordering_plant ?? null,
        destination_plant: (submissionData as any).destination_plant ?? null,
        destination_store: (submissionData as any).store ?? null,
        meta: { ui: 'MTOOrderForm', elevated: elevated ?? false },
      });
    }

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'mto_submission' 
    });
  }
}

export async function submitWheelOrder(orderData: any) {
  logger.info('Submitting wheel order', { service: 'wheel_submission' });

  try {
    // Get current user for role-based validation
    const user = await getCurrentUser();
    const elevated = isElevated(user);
    
    logger.info('Wheel order submission access check', { 
      elevated, 
      userEmail: user.email, 
      userRole: user.role, 
      service: 'wheel_submission' 
    });

    let submissionData = { ...orderData };

    // Validate and scrub cross-plant fields for non-elevated users
    if (!elevated) {
      submissionData = scrubCrossPlantForNonElevated(submissionData);
      logger.info('Cross-plant fields scrubbed for non-elevated wheel user', { 
        userEmail: user.email, 
        service: 'wheel_submission' 
      });
    } else {
      // For elevated users, validate cross-plant consistency
      try {
        assertCrossPlantConsistency(submissionData);
        logger.info('Cross-plant validation passed for elevated wheel user', { 
          userEmail: user.email, 
          service: 'wheel_submission' 
        });
      } catch (validationError: any) {
        logger.error('Cross-plant validation failed for wheel order', { 
          error: validationError.message, 
          userEmail: user.email, 
          service: 'wheel_submission' 
        });
        throw validationError;
      }
    }

    const { data, error } = await supabase
      .from('wheel_orders')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const usedCrossPlant = !!((submissionData as any).ordering_store || (submissionData as any).ordering_plant || (submissionData as any).destination_plant);

    // Breadcrumb for dev tools
    console.info('[wheel_orders] submitted', {
      id: data?.id,
      elevated,
      cp: usedCrossPlant,
    });

    logger.info('Wheel order submitted successfully', { 
      orderId: data.id, 
      elevated,
      hasCrossPlantFields: usedCrossPlant,
      service: 'wheel_submission' 
    });

    // Fire-and-forget audit (don't block UX)
    if (usedCrossPlant) {
      auditCrossPlant({
        order_type: 'mto', // wheel orders use mto table
        order_id: data?.id ? Number(data.id) : null,
        user_email: user.email,
        user_role: user.role,
        ordering_store: (submissionData as any).ordering_store ?? null,
        ordering_plant: (submissionData as any).ordering_plant ?? null,
        destination_plant: (submissionData as any).destination_plant ?? null,
        destination_store: (submissionData as any).store ?? null,
        meta: { ui: 'WheelOrderForm', elevated: elevated ?? false },
      });
    }

    return errorHandler.success(data);
  } catch (error) {
    return errorHandler.handleError(error, { 
      service: 'wheel_submission' 
    });
  }
}