import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Store, Route, Truck, ArrowRight, CheckCircle } from 'lucide-react';

interface SummaryData {
  // Source
  source_store?: string;
  source_plant?: string;
  
  // Transfer details
  transfer_route?: string;
  carrier?: string;
  
  // Destination
  destination_plant?: string;
  destination_store?: string;
  
  // Cross-dock
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  crossDockConfirmation?: boolean;
  
  // Product info for context
  productNumber?: string;
  description?: string;
  quantity?: string | number;
  scheduleArrival?: string;
}

interface UnifiedOrderSummaryProps {
  data: SummaryData;
  className?: string;
}

export function UnifiedOrderSummary({ data, className = '' }: UnifiedOrderSummaryProps) {
  // Don't render if no meaningful data
  const hasRoutingData = data.transfer_route || data.destination_plant || data.destination_store;
  if (!hasRoutingData) return null;

  const formatTransferRoute = (route?: string) => {
    if (!route) return null;
    
    const routeMap: Record<string, string> = {
      'store->store': 'Store → Store',
      'store->plant': 'Store → Plant', 
      'plant->store': 'Plant → Store',
      'plant->plant': 'Plant → Plant',
    };
    
    return routeMap[route] || route;
  };

  const getTransferRouteIcon = (route?: string) => {
    if (!route) return <Route className="h-4 w-4" />;
    
    if (route.includes('store')) {
      return <Store className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  };

  const isCrossPlantTransfer = () => {
    return data.source_plant && data.destination_plant && data.source_plant !== data.destination_plant;
  };

  return (
    <Card className={`border-green-200 dark:border-green-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Order Summary</span>
          {isCrossPlantTransfer() && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Cross-Region Transfer
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transfer Route */}
        {data.transfer_route && (
          <div className="flex items-center space-x-3">
            {getTransferRouteIcon(data.transfer_route)}
            <span className="text-sm font-medium">Transfer Type:</span>
            <Badge variant="secondary">{formatTransferRoute(data.transfer_route)}</Badge>
          </div>
        )}

        {/* Source Information */}
        {data.source_store && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>Source</span>
            </div>
            <div className="ml-6 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Store:</span>
                <span className="font-medium">{data.source_store}</span>
              </div>
              {data.source_plant && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fulfillment Plant:</span>
                  <span className="font-medium">{data.source_plant}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Destination Information */}
        {(data.destination_plant || data.destination_store) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Store className="h-4 w-4" />
              <span>Destination</span>
            </div>
            <div className="ml-6 space-y-1 text-sm">
              {data.destination_plant && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plant:</span>
                  <span className="font-medium">{data.destination_plant}</span>
                </div>
              )}
              {data.destination_store && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Store:</span>
                  <span className="font-medium">{data.destination_store}</span>
                </div>
              )}
              {!data.destination_store && data.transfer_route === 'plant->plant' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Store:</span>
                  <span className="font-medium text-gray-500">Plant-level delivery</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Carrier Information */}
        {data.carrier && (
          <div className="flex items-center space-x-3">
            <Truck className="h-4 w-4" />
            <span className="text-sm font-medium">Carrier:</span>
            <Badge variant="outline">{data.carrier}</Badge>
          </div>
        )}

        {/* Cross-Dock Information */}
        {data.crossDock === "Yes" && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                <ArrowRight className="h-4 w-4" />
                <span>Cross-Dock Details</span>
              </div>
              <div className="ml-6 space-y-1 text-sm">
                {data.crossDockDestination && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Destination:</span>
                    <span className="font-medium">{data.crossDockDestination}</span>
                  </div>
                )}
                {data.receiverNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Receiver No:</span>
                    <span className="font-medium">{data.receiverNo}</span>
                  </div>
                )}
                {data.etaDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ETA Date:</span>
                    <span className="font-medium">{data.etaDate}</span>
                  </div>
                )}
                {data.crossDockConfirmation && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">Paperwork confirmed</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Product Summary (if available) */}
        {(data.productNumber || data.description) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Product Summary
              </div>
              <div className="ml-6 space-y-1 text-sm">
                {data.productNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Product #:</span>
                    <span className="font-medium">{data.productNumber}</span>
                  </div>
                )}
                {data.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                    <span className="font-medium">{data.description}</span>
                  </div>
                )}
                {data.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="font-medium">{data.quantity}</span>
                  </div>
                )}
                {data.scheduleArrival && data.scheduleArrival !== "N/A" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Arrival:</span>
                    <span className="font-medium">{data.scheduleArrival}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}