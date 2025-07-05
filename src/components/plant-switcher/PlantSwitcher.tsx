import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2, ArrowRightLeft } from 'lucide-react';
import { usePlant, Plant } from '@/contexts/PlantContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlantSwitching } from '@/hooks/usePlantSwitching';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PLANT_COLORS = {
  'Grand Prairie 97': 'bg-blue-500',
  'Romulus 98': 'bg-green-500', 
  'Mulberry 99': 'bg-orange-500'
};

const PLANT_OPTIONS: Plant[] = ['Grand Prairie 97', 'Romulus 98', 'Mulberry 99'];

export function PlantSwitcher() {
  const { currentPlant, setCurrentPlant, defaultPlant, isCrossPlantOrder } = usePlant();
  const { user } = useAuth();
  const { logPlantSwitch, updateUserPreferences } = usePlantSwitching();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPlant, setPendingPlant] = useState<Plant | null>(null);

  const handlePlantChange = (newPlant: Plant) => {
    if (newPlant === currentPlant) return;
    
    if (newPlant !== defaultPlant) {
      setPendingPlant(newPlant);
      setShowConfirmation(true);
    } else {
      confirmPlantSwitch(newPlant);
    }
  };

  const confirmPlantSwitch = async (newPlant: Plant) => {
    const oldPlant = currentPlant;
    setCurrentPlant(newPlant);
    
    // Log the plant switch
    await logPlantSwitch({
      from_plant: oldPlant,
      to_plant: newPlant,
      switch_reason: newPlant === defaultPlant ? 'return_to_default' : 'cross_plant_order'
    });

    // Update user preferences
    await updateUserPreferences(newPlant);
    
    setShowConfirmation(false);
    setPendingPlant(null);
  };

  const cancelSwitch = () => {
    setShowConfirmation(false);
    setPendingPlant(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Plant Switcher */}
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">Ordering From:</span>
            <div className={`w-2 h-2 rounded-full ${PLANT_COLORS[currentPlant]}`} />
          </div>
          
          <Select value={currentPlant} onValueChange={handlePlantChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANT_OPTIONS.map((plant) => (
                <SelectItem key={plant} value={plant}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${PLANT_COLORS[plant]}`} />
                    <span>{plant}</span>
                    {plant === defaultPlant && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCrossPlantOrder && (
          <Badge variant="outline" className="flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            Cross-Plant
          </Badge>
        )}
      </div>

      {/* Cross-Plant Warning Banner */}
      {isCrossPlantOrder && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're ordering from <strong>{currentPlant}</strong> instead of your default plant (<strong>{defaultPlant}</strong>).
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 ml-2 text-orange-700 underline"
              onClick={() => confirmPlantSwitch(defaultPlant)}
            >
              Switch back to default
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && pendingPlant && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <p>
                You're switching from <strong>{currentPlant}</strong> to <strong>{pendingPlant}</strong>. 
                This will affect which plant processes your orders.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => confirmPlantSwitch(pendingPlant)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Switch
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={cancelSwitch}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Plant Info Display */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Current: <span className="font-medium">{currentPlant}</span></div>
        <div>Default: <span className="font-medium">{defaultPlant}</span></div>
        {user?.storeName && (
          <div>Store: <span className="font-medium">{user.storeName}</span></div>
        )}
      </div>
    </div>
  );
}