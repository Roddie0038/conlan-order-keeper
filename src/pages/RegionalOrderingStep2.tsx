import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { RoleAccessGuard } from '@/components/regional-ordering/RoleAccessGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderFormData {
  productNumber: string;
  description: string;
  quantity: string;
  notes: string;
}

export default function RegionalOrderingStep2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<OrderFormData>({
    productNumber: '',
    description: '',
    quantity: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get plant and store data from navigation state
  const { sourcePlant, destinationStore } = location.state || {};

  useEffect(() => {
    // Route guard - redirect if no plant/store data
    if (!sourcePlant || !destinationStore) {
      navigate('/regional-ordering');
      return;
    }
  }, [sourcePlant, destinationStore, navigate]);

  if (!hasRegionalOrderingAccess(user)) {
    return <RoleAccessGuard />;
  }

  if (!sourcePlant || !destinationStore) {
    return null; // Will redirect
  }

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productNumber || !formData.quantity) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in product number and quantity.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for submission
      const orderData = {
        plant: sourcePlant,
        store: destinationStore,
        full_name: user?.email || '',
        email: user?.email || '',
        role: user?.role || '',
        product_number: formData.productNumber,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
        timestamp: new Date().toISOString(),
        order_type: 'transfer'
      };

      // Call the edge function
      const response = await fetch('https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/handleOrdersPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      toast({
        title: "Order Submitted Successfully",
        description: "Your regional order has been sent for processing.",
      });

      // Navigate back to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/regional-ordering');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Regional Ordering - Step 2
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                Create order for {destinationStore} from Plant {sourcePlant}
              </p>
            </div>
            
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Step 1
            </Button>
          </div>
        </div>

        {/* Order Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Context Display */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Source Plant:</span> {sourcePlant}
                    </div>
                    <div>
                      <span className="font-medium">Destination:</span> {destinationStore}
                    </div>
                  </div>
                </div>

                {/* Product Number */}
                <div className="space-y-2">
                  <Label htmlFor="product-number">Product Number *</Label>
                  <Input
                    id="product-number"
                    value={formData.productNumber}
                    onChange={(e) => handleInputChange('productNumber', e.target.value)}
                    placeholder="Enter product number"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or special instructions"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !formData.productNumber || !formData.quantity}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Order...
                      </>
                    ) : (
                      <>
                        Submit Order
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}