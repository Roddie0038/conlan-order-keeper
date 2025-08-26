import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, ArrowLeft, Package } from 'lucide-react';

// Helper function to get display name from user object
function getDisplayName(user?: any): string {
  return user?.full_name
      ?? user?.name
      ?? user?.user_metadata?.full_name
      ?? user?.email
      ?? 'Not provided';
}

interface RegionalOrderingStep2Props {
  plant: string;
  store: string;
}

interface OrderData {
  productNumber: string;
  quantity: string;
  notes: string;
}

export function RegionalOrderingStep2({ plant, store }: RegionalOrderingStep2Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderData>({
    productNumber: '',
    quantity: '',
    notes: ''
  });

  const handleInputChange = (field: keyof OrderData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productNumber.trim() || !formData.quantity.trim()) {
      toast({
        title: "Validation Error",
        description: "Product number and quantity are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const idemKey = crypto.randomUUID();
      const { data, error } = await supabase.functions.invoke('handleOrdersPost', {
        body: {
          product_number: formData.productNumber.trim(),
          quantity: parseInt(formData.quantity, 10),
          notes: formData.notes.trim(),
          store, plant,
          name: getDisplayName(user),
          email: user?.email ?? '',
          role: user?.role ?? '',
          timestamp: new Date().toISOString(),
          idempotency_key: idemKey
        }
      });

      if (error) throw new Error(error.message || 'Failed to submit order');

      if (data?.duplicate) {
        toast({ title: 'Already submitted', description: 'We recognized a retry and kept your original submission.' });
      } else {
        toast({ title: 'Order Submitted', description: `Processed by ${plant}.` });
      }

      // Navigate back to step 1
      navigate('/regional-ordering');
      
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/regional-ordering');
  };

  const isValid = formData.productNumber.trim() && formData.quantity.trim() && !isNaN(Number(formData.quantity));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Regional Order Form</h1>
        </div>
        <p className="text-muted-foreground">
          Complete your order for {store} from {plant}
        </p>
      </div>

      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plant/Store Selection
      </Button>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Store</Label>
              <p className="text-muted-foreground">{store}</p>
            </div>
            <div>
              <Label className="font-medium">Plant</Label>
              <p className="text-muted-foreground">{plant}</p>
            </div>
            <div>
              <Label className="font-medium">Name</Label>
              <p className="text-muted-foreground">{getDisplayName(user)}</p>
            </div>
            <div>
              <Label className="font-medium">Email</Label>
              <p className="text-muted-foreground">{user?.email || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productNumber">Product Number *</Label>
                <Input
                  id="productNumber"
                  value={formData.productNumber}
                  onChange={handleInputChange('productNumber')}
                  placeholder="Enter product number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  placeholder="Enter quantity"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}