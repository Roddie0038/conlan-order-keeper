import { useState, useEffect, useMemo } from 'react';
import { fetchInventoryCache, subscribeToInventoryCache, InventoryCacheItem } from '@/services/inventoryCacheService';
import { toast } from '@/components/ui/use-toast';

export function useInventoryCache() {
  const [inventory, setInventory] = useState<InventoryCacheItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantFilter, setPlantFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch initial data
  useEffect(() => {
    loadInventory();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    console.log('[InventoryCache] Setting up real-time subscription');
    const unsubscribe = subscribeToInventoryCache((payload) => {
      console.log('[InventoryCache] Real-time update:', payload);
      loadInventory();
    });

    return unsubscribe;
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchInventoryCache();
      setInventory(data);
    } catch (error) {
      console.error('[InventoryCache] Error loading inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique plants for filter dropdown
  const plants = useMemo(() => {
    const uniquePlants = new Set(inventory.map(item => item.plant));
    return Array.from(uniquePlants).sort();
  }, [inventory]);

  // Filter inventory based on search and filters
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.product_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.plant.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlant = plantFilter === 'all' || item.plant === plantFilter;
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'low_stock' && item.low_stock) ||
        (statusFilter === 'out_of_stock' && item.quantity === 0) ||
        (statusFilter === 'available' && item.quantity > 0 && !item.low_stock);

      return matchesSearch && matchesPlant && matchesStatus;
    });
  }, [inventory, searchTerm, plantFilter, statusFilter]);

  return {
    inventory: filteredInventory,
    loading,
    searchTerm,
    setSearchTerm,
    plantFilter,
    setPlantFilter,
    statusFilter,
    setStatusFilter,
    plants,
    refreshInventory: loadInventory
  };
}
