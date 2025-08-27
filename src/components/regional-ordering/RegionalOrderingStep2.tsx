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

interface RegionalOrderingStep2Props {
  origin: string;
  dest: string;
  kind: string;
}

export function RegionalOrderingStep2({ origin, dest, kind }: RegionalOrderingStep2Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Single line item state (Phase 1)
  const [productNumber, setProductNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productNumber.trim() || !quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Product number and valid quantity are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const idemKey = crypto.randomUUID();
      const { data, error } = await supabase.functions.invoke('handleOrdersPost', {
        body: {
          origin_ot_id: origin,
          destination_ot_id: dest,
          destination_kind: kind,
          product_number: productNumber.trim(),
          quantity: Number(quantity),
          notes: notes.trim() || '',
          name: user?.user_metadata?.full_name || user?.email || 'Unknown',
          email: user?.email ?? '',
          role: user?.role ?? '',
          timestamp: new Date().toISOString(),
          idempotency_key: idemKey
        }
      });

      if (error) throw new Error(error.message || 'Failed to submit order');

      if (data?.conflict) {
        toast({ title: 'Already submitted', description: 'We recognized a retry and kept your original submission.' });
      } else {
        toast({ title: 'Order Submitted', description: 'Order submitted successfully.' });
      }

      // Navigate back to Step 1 (Phase 1 behavior)
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

  const isValid = productNumber.trim() && quantity.trim() && !isNaN(Number(quantity)) && Number(quantity) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Regional Order Form</h1>
        </div>
        <p className="text-muted-foreground">
          Complete your {kind === 'plant' ? 'plant-to-plant' : 'plant-to-store'} order
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
              <Label className="font-medium">Origin</Label>
              <p className="text-muted-foreground">{origin}</p>
            </div>
            <div>
              <Label className="font-medium">Destination</Label>
              <p className="text-muted-foreground">{dest}</p>
            </div>
            <div>
              <Label className="font-medium">Name</Label>
              <p className="text-muted-foreground">{user?.user_metadata?.full_name || user?.email || 'Not provided'}</p>
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
            <div className="space-y-2">
              <Label htmlFor="productNumber">Product Number *</Label>
              <Input
                id="productNumber"
                value={productNumber}
                onChange={(e) => setProductNumber(e.target.value)}
                placeholder="Enter product number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or special instructions"
                rows={3}
              />
            </div>

            <div className="flex justify-end pt-4">
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