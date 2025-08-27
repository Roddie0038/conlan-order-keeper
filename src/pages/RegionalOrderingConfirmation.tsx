import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowLeft, Building2 } from 'lucide-react';

export default function RegionalOrderingConfirmation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      navigate('/regional-ordering', { replace: true });
    }
  }, [orderId, navigate]);

  if (!hasRegionalOrderingAccess(user)) {
    return <Navigate to="/" replace />;
  }

  if (!orderId) return null;

  const handleNewOrder = () => {
    navigate('/regional-ordering');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">
                Order Submitted Successfully
              </h1>
              <p className="text-muted-foreground mt-2">
                Your regional order has been received and is being processed.
              </p>
            </div>
          </div>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Order ID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{orderId}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Submitted By</label>
                  <p>{user?.user_metadata?.full_name || user?.email || 'Unknown User'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Submission Time</label>
                  <p>{new Date().toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <p className="text-green-600 font-medium">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Order Review</p>
                    <p className="text-muted-foreground">Your order will be reviewed by the fulfillment team.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-muted-foreground">Items will be prepared and packaged for shipment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Notification</p>
                    <p className="text-muted-foreground">You'll receive email updates on order status and tracking information.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleNewOrder}
              size="lg"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Submit Another Order
            </Button>
            <Button 
              variant="outline"
              onClick={handleBackToDashboard}
              size="lg"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}