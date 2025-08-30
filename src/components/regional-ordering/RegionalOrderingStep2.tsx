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

      // Map 3-digit plant codes to real OT IDs as stored in app_plants
      const PLANT_CODE_TO_OT_ID: Record<string, string> = {
        '097': 'Grand Prairie 097',
        '098': 'Romulus 098',
        '099': 'Mulberry 099',
      };
      // If Step 1 passed labels like "Grand Prairie 097", pull the 3-digit code
      const extractCode = (val: string) => {
        const m = String(val || '').match(/\b(097|098|099)\b/);
        return m ? m[1] : '';
      };

      const normalizePlantLike = (val: string) => {
        const code = extractCode(val);
        if (code && PLANT_CODE_TO_OT_ID[code]) return PLANT_CODE_TO_OT_ID[code];
        return val; // assume it's already an OT ID
      };

      // Ensure exact kind
      const destinationKind = kind === 'store' ? 'store' : 'plant';

      const payload = {
        origin_ot_id: normalizePlantLike(origin),
        destination_ot_id: normalizePlantLike(dest),
        destination_kind: destinationKind,
        product_number: productNumber.trim(),
        quantity: Number(quantity),
        notes: notes.trim() || '',
        name: user?.user_metadata?.full_name || user?.email || 'Unknown',
        email: user?.email ?? '',
        role: (user as any)?.role ?? '',
        timestamp: new Date().toISOString(),
        idempotency_key: idemKey,
      };

      console.log('▶️ handleOrdersPost payload', payload);

      const { data, error } = await supabase.functions.invoke('handleOrdersPost', { body: payload });

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

      {/* Order Form with Uiverse.io styling */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div style={{
            '--bg-light': '#efefef',
            '--bg-dark': '#707070',
            '--clr': '#58bc82',
            '--clr-alpha': '#9c9c9c60'
          } as React.CSSProperties}>
            <form 
              onSubmit={handleSubmit} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label 
                  htmlFor="productNumber" 
                  style={{
                    alignSelf: 'flex-start',
                    color: '#58bc82',
                    fontWeight: 600
                  }}
                >
                  Product Number *
                </label>
                <input
                  id="productNumber"
                  value={productNumber}
                  onChange={(e) => setProductNumber(e.target.value)}
                  placeholder="Enter product number"
                  style={{
                    borderRadius: '0.5rem',
                    padding: '1rem 0.75rem',
                    width: '100%',
                    border: 'none',
                    backgroundColor: '#9c9c9c60',
                    outline: '2px solid #707070',
                    transition: 'all 300ms'
                  }}
                  onFocus={(e) => e.target.style.outline = '2px solid #58bc82'}
                  onBlur={(e) => e.target.style.outline = '2px solid #707070'}
                />
              </div>

              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label 
                  htmlFor="quantity" 
                  style={{
                    alignSelf: 'flex-start',
                    color: '#58bc82',
                    fontWeight: 600
                  }}
                >
                  Quantity *
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  style={{
                    borderRadius: '0.5rem',
                    padding: '1rem 0.75rem',
                    width: '100%',
                    border: 'none',
                    backgroundColor: '#9c9c9c60',
                    outline: '2px solid #707070',
                    transition: 'all 300ms'
                  }}
                  onFocus={(e) => e.target.style.outline = '2px solid #58bc82'}
                  onBlur={(e) => e.target.style.outline = '2px solid #707070'}
                />
              </div>

              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <label 
                  htmlFor="notes" 
                  style={{
                    alignSelf: 'flex-start',
                    color: '#58bc82',
                    fontWeight: 600
                  }}
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                  style={{
                    borderRadius: '0.5rem',
                    padding: '1rem 0.75rem',
                    width: '100%',
                    border: 'none',
                    backgroundColor: '#9c9c9c60',
                    outline: '2px solid #707070',
                    transition: 'all 300ms',
                    resize: 'none'
                  }}
                  onFocus={(e) => e.target.style.outline = '2px solid #58bc82'}
                  onBlur={(e) => e.target.style.outline = '2px solid #707070'}
                />
              </div>

              <button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                style={{
                  padding: '1rem 0.75rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '3rem',
                  backgroundColor: isSubmitting || !isValid ? '#707070' : '#707070',
                  color: '#efefef',
                  border: 'none',
                  cursor: isSubmitting || !isValid ? 'not-allowed' : 'pointer',
                  transition: 'all 300ms',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  opacity: isSubmitting || !isValid ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && isValid) {
                    e.currentTarget.style.backgroundColor = '#58bc82';
                    e.currentTarget.style.color = '#707070';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && isValid) {
                    e.currentTarget.style.backgroundColor = '#707070';
                    e.currentTarget.style.color = '#efefef';
                  }
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}