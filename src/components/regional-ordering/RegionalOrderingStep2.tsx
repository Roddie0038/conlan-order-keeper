import React, { useState, useEffect } from 'react';
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
import styles from './RegionalOrderingStep2.module.css';

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

  // Add build info for regional flow
  useEffect(() => {
    const buildInfo = { 
      branch: 'main', 
      sha: 'standard-regional-separation-v1',
      timestamp: new Date().toISOString(),
      flow: 'regional'
    };
    console.info('[BUILD]', buildInfo);
  }, []);
  
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
    const corr = crypto.randomUUID();
    const tag = (stage: string, extra: any = {}) =>
      console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);

    tag('CLICK');
    tag('ONSUBMIT_ENTER', { flow: 'regional' });

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

      tag('BUILD_PAYLOAD_ENTER');
      
      // Regional ordering payload with proper typing
      const payload = {
        type: 'regional' as const,
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
        _corr: corr,
      };

      tag('BUILD_PAYLOAD_EXIT', { 
        productNumber: payload.product_number,
        quantity: payload.quantity,
        _corr: corr 
      });

      tag('RPC_CALL', { endpoint: 'handleOrdersPost' });
      const { data, error } = await supabase.functions.invoke('handleOrdersPost', { body: payload });

      if (error) {
        tag('RPC_FAIL', { error: error.message });
        throw new Error(error.message || 'Failed to submit order');
      }

      tag('RPC_OK', { data });

      if (data?.conflict) {
        toast({ title: 'Already submitted', description: `We recognized a retry and kept your original submission [${corr}]` });
      } else {
        toast({ title: 'Order Submitted', description: `Order submitted successfully [${corr}]` });
      }

      // Navigate back to Step 1 (Phase 1 behavior)
      navigate('/regional-ordering');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      tag('RPC_FAIL', { error: errorMessage });
      console.error('Order submission error:', error);
      toast({
        title: "Submission Failed",
        description: `${errorMessage} [${corr}]`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      tag('ONSUBMIT_EXIT');
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
        <CardContent>
          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputSpan}>
                <label htmlFor="productNumber" className={styles.label}>Product Number *</label>
                <input
                  id="productNumber"
                  name="productNumber"
                  value={productNumber}
                  onChange={(e) => setProductNumber(e.target.value)}
                  placeholder="Enter product number"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputSpan}>
                <label htmlFor="quantity" className={styles.label}>Quantity *</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className={styles.input}
                  required
                  inputMode="numeric"
                />
              </div>

              <div className={styles.inputSpan}>
                <label htmlFor="notes" className={styles.label}>Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              <button
                type="submit"
                className={styles.submit}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Order'}
              </button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}