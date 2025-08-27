import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlant } from '@/contexts/PlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to get display name from user object
function getDisplayName(user?: any): string {
  return user?.full_name
      ?? user?.name
      ?? user?.user_metadata?.full_name
      ?? user?.email
      ?? 'Not provided';
}

interface RegionalOrderingStep1Props {
  onContinue: (plant: string, store: string) => void;
}

export function RegionalOrderingStep1({ onContinue }: RegionalOrderingStep1Props) {
  const { user } = useAuth();
  const { currentPlant } = usePlant();
  const navigate = useNavigate();
  const [selectedPlant, setSelectedPlant] = useState<string>(currentPlant || '');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [plants, setPlants] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchPlants = async () => {
      const { data, error } = await supabase
        .from('app_plants' as any)
        .select('ot_id,label,active')
        .eq('active', true)
        .order('label');
      
      if (data && !error) {
        setPlants(data.map((plant: any) => ({
          value: plant.ot_id,
          label: plant.label
        })));
      }
    };

    fetchPlants();
  }, []);

  const stores = [
    { value: 'Fort Worth 022', label: 'Fort Worth 022' },
    { value: 'Grand Prairie 027', label: 'Grand Prairie 027' },
    { value: 'Irving 039', label: 'Irving 039' },
    { value: 'Garland 048', label: 'Garland 048' }
  ];

  const handleContinue = () => {
    if (selectedPlant && selectedStore) {
      navigate(`/regional-ordering/submit?plant=${encodeURIComponent(selectedPlant)}&store=${encodeURIComponent(selectedStore)}`);
    }
  };

  const isValid = selectedPlant && selectedStore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Building2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Regional Ordering</h1>
        </div>
        <p className="text-muted-foreground">
          Select plant and store to begin your regional order
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm text-muted-foreground">{getDisplayName(user)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <p className="text-sm text-muted-foreground">{user?.role || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Plant</Label>
              <p className="text-sm text-muted-foreground">{currentPlant || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant and Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Plant and Store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plant">Plant</Label>
              <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plant" />
                </SelectTrigger>
                <SelectContent>
                  {plants.map((plant) => (
                    <SelectItem key={plant.value} value={plant.value}>
                      {plant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.value} value={store.value}>
                      {store.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue}
          disabled={!isValid}
          size="lg"
          className="flex items-center gap-2"
        >
          Continue to Order Form
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}