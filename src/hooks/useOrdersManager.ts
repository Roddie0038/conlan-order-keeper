
import { useState, useEffect, useCallback } from 'react';
import { useFetchOrders } from './useFetchOrders';
import { useFetchMTOOrders } from './useFetchMTOOrders';
import { useFetchWheelOrders } from './useFetchWheelOrders';
import { useFetchWarrantyOrders } from './useFetchWarrantyOrders';

export function useOrdersManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all order types
  const { 
    orders: transferOrders, 
    loading: transferLoading, 
    error: transferError,
    refreshOrders: refreshTransfer 
  } = useFetchOrders();
  
  const { 
    orders: mtoOrders, 
    loading: mtoLoading, 
    error: mtoError,
    refreshOrders: refreshMTO 
  } = useFetchMTOOrders();
  
  const { 
    orders: wheelOrders, 
    loading: wheelLoading, 
    error: wheelError,
    refreshOrders: refreshWheel 
  } = useFetchWheelOrders();
  
  const { 
    orders: warrantyOrders, 
    loading: warrantyLoading, 
    error: warrantyError,
    refreshOrders: refreshWarranty 
  } = useFetchWarrantyOrders();

  // Aggregate loading state
  useEffect(() => {
    const isLoading = transferLoading || mtoLoading || wheelLoading || warrantyLoading;
    setLoading(isLoading);
  }, [transferLoading, mtoLoading, wheelLoading, warrantyLoading]);

  // Aggregate error state
  useEffect(() => {
    const firstError = transferError || mtoError || wheelError || warrantyError;
    setError(firstError);
  }, [transferError, mtoError, wheelError, warrantyError]);

  const refreshAllOrders = useCallback(() => {
    refreshTransfer();
    refreshMTO();
    refreshWheel();
    refreshWarranty();
  }, [refreshTransfer, refreshMTO, refreshWheel, refreshWarranty]);

  return {
    orders: {
      transfer: transferOrders,
      mto: mtoOrders,
      wheel: wheelOrders,
      warranty: warrantyOrders
    },
    loading,
    error,
    refreshAllOrders
  };
}
