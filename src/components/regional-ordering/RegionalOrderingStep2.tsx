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
import { Building2, ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';

// Helper function to get display name from user object
function getDisplayName(user?: any): string {
  return user?.full_name
      ?? user?.name
      ?? user?.user_metadata?.full_name
      ?? user?.email
      ?? 'Not provided';
}

interface RegionalOrderingStep2Props {
  origin: string;
  dest: string;
  kind: string;
}

interface LineItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: string;
  notes: string;
}

export function RegionalOrderingStep2({ origin, dest, kind }: RegionalOrderingStep2Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      productNumber: '',
      description: '',
      quantity: '',
      notes: ''
    }
  ]);

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, {
      id: crypto.randomUUID(),
      productNumber: '',
      description: '',
      quantity: '',
      notes: ''
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all line items
    const validItems = lineItems.filter(item => 
      item.productNumber.trim() && 
      item.description.trim() && 
      item.quantity.trim() && 
      !isNaN(Number(item.quantity)) && 
      Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid line item is required (product number, description, and quantity > 0).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📦 REGIONAL: Submitting order with origin:', origin, 'dest:', dest, 'kind:', kind);
      
      const payload = {
        // Legacy format for backward compatibility
        origin_ot_id: origin,
        destination_ot_id: dest,
        destination_kind: kind,
        regional_enabled: true,
        order_type: 'transfer' as const,
        source_mode: kind === 'plant' ? 'PLANT_TO_PLANT' : 'STORE_TO_PLANT' as const,
        // New multi-line format
        line_items: validItems.map(item => ({
          product_number: item.productNumber.trim(),
          description: item.description.trim(),
          quantity: Number(item.quantity),
          notes: item.notes.trim() || undefined
        })),
        // Requester info
        requester: {
          full_name: getDisplayName(user),
          email: user?.email ?? '',
          role: user?.role ?? ''
        },
        idempotency_key: crypto.randomUUID()
      };

      console.log('📦 REGIONAL: Payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('create-regional-order', {
        body: payload
      });

      if (error) throw new Error(error.message || 'Failed to submit order');

      console.log('📦 REGIONAL: Response:', data);

      if (data?.conflict) {
        toast({ title: 'Already submitted', description: 'We recognized a retry and kept your original submission.' });
      } else {
        toast({ title: 'Order Submitted', description: 'Order submitted successfully.' });
      }

      // Navigate to confirmation page
      const orderId = data?.order?.id || 'unknown';
      navigate(`/regional-ordering/confirmation?order_id=${encodeURIComponent(orderId)}`);
      
    } catch (error) {
      console.error('📦 REGIONAL: Order submission error:', error);
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

  const isValid = lineItems.some(item => 
    item.productNumber.trim() && 
    item.description.trim() && 
    item.quantity.trim() && 
    !isNaN(Number(item.quantity)) && 
    Number(item.quantity) > 0
  );

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
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {lineItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Line Item {index + 1}</h4>
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`productNumber-${item.id}`}>Product Number *</Label>
                    <Input
                      id={`productNumber-${item.id}`}
                      value={item.productNumber}
                      onChange={(e) => handleLineItemChange(item.id, 'productNumber', e.target.value)}
                      placeholder="Enter product number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`description-${item.id}`}>Description *</Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      placeholder="Product description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${item.id}`}>Notes (Optional)</Label>
                    <Input
                      id={`notes-${item.id}`}
                      value={item.notes}
                      onChange={(e) => handleLineItemChange(item.id, 'notes', e.target.value)}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>
            ))}

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