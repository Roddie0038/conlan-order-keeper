import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasRegionalOrderingAccess } from '@/utils/regionalOrderingAccess';
import { RoleAccessGuard } from '@/components/regional-ordering/RoleAccessGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { STORES, PLANTS } from '@/lib/stores';
import { ArrowRight, Building2, MapPin } from 'lucide-react';

export default function RegionalOrderingStep1() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourcePlant, setSourcePlant] = useState<string>('');
  const [destinationStore, setDestinationStore] = useState<string>('');

  if (!hasRegionalOrderingAccess(user)) {
    return <RoleAccessGuard />;
  }

  const handleContinue = () => {
    if (!sourcePlant || !destinationStore) {
      return;
    }

    // Pass plant and store data to the next step
    navigate('/regional-ordering/submit', {
      state: {
        sourcePlant,
        destinationStore
      }
    });
  };

  const isFormValid = sourcePlant && destinationStore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Regional Ordering - Step 1
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                Select source plant and destination store
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1 Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Plant & Store Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Source Plant Selection */}
              <div className="space-y-2">
                <Label htmlFor="source-plant">Source Plant</Label>
                <Select value={sourcePlant} onValueChange={setSourcePlant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source plant..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="097">097</SelectItem>
                    <SelectItem value="098">098</SelectItem>
                    <SelectItem value="099">099</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Store Selection */}
              <div className="space-y-2">
                <Label htmlFor="destination-store">Destination Store</Label>
                <Select value={destinationStore} onValueChange={setDestinationStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map((store) => (
                      <SelectItem key={store.code} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Continue Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleContinue}
                  disabled={!isFormValid}
                  className="w-full"
                  size="lg"
                >
                  Continue to Order Form
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}