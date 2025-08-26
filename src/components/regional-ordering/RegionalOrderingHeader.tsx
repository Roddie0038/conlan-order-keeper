import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlant } from '@/contexts/PlantContext';
import { Building2, MapPin } from 'lucide-react';

export function RegionalOrderingHeader() {
  const { user } = useAuth();
  const { currentPlant } = usePlant();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Regional Ordering
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
            Create orders for any plant or store across the network
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How to Order:</strong> Select the store or plant placing the order. For plant-to-plant transfers, choose the originating and destination plants.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{currentPlant}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{user?.role?.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}