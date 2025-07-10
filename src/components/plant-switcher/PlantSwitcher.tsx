import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2, ArrowRightLeft, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlant, Plant } from '@/contexts/PlantContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlantSwitching } from '@/hooks/usePlantSwitching';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

const PLANT_COLORS = {
  'Grand Prairie 97': 'bg-blue-500',
  'Romulus 98': 'bg-green-500', 
  'Mulberry 99': 'bg-orange-500'
};

const PLANT_OPTIONS: Plant[] = ['Grand Prairie 97', 'Romulus 98', 'Mulberry 99'];

export function PlantSwitcher() {
  const { currentPlant, setCurrentPlant, selectedPlant, setSelectedPlant, defaultPlant, isCrossPlantOrder } = usePlant();
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
    
    // Update both plant states to ensure synchronization
    setCurrentPlant(newPlant);
    setSelectedPlant(newPlant);
    
    console.log('🔄 Plant switching:', { from: oldPlant, to: newPlant });
    
    // Log the plant switch
    await logPlantSwitch({
      from_plant: oldPlant,
      to_plant: newPlant,
      switch_reason: newPlant === defaultPlant ? 'return_to_default' : 'user_selection'
    });

    // Update user preferences
    await updateUserPreferences(newPlant);
    
    // Show success toast
    toast({
      title: "✅ Plant Switched Successfully",
      description: `Dashboard updated to ${newPlant}`,
      variant: "default"
    });
    
    setShowConfirmation(false);
    setPendingPlant(null);
  };

  const cancelSwitch = () => {
    setShowConfirmation(false);
    setPendingPlant(null);
  };

  return (
    <TooltipProvider>
        <div className="space-y-4">
          {/* Main Plant Switcher - Glassy Dark Design */}
          <div className="relative">
            {/* Enhanced Neon Blue Glowing Border Container with Pulse Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/30 to-blue-500/20 rounded-2xl blur-sm animate-pulse"></div>
            <div className="absolute inset-0 border-2 border-blue-400/60 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-[pulse_3s_ease-in-out_infinite]"></div>
            
            {/* Main Content Container */}
            <div className="relative backdrop-blur-md bg-black/40 p-6 rounded-2xl border border-blue-400/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-black/50 hover:border-blue-400/50">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Choose Plant</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-blue-400 hover:text-blue-300">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/80 text-white border-blue-400/30">
                    <p>Switch to a different warehouse location</p>
                  </TooltipContent>
                </Tooltip>
              </div>

            {/* Current Plant Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-300 mb-1">Current Plant</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${PLANT_COLORS[currentPlant]} shadow-lg`} />
                    <span className="text-lg font-semibold text-white">{currentPlant}</span>
                    {isCrossPlantOrder && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-orange-500/20 border-orange-400/60 text-orange-300">
                        <ArrowRightLeft className="h-3 w-3" />
                        Cross-Plant
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Default Plant: <span className="text-blue-300 font-medium">{defaultPlant}</span>
              </div>
            </div>

            {/* Plant Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Switch to:</label>
              <Select value={currentPlant} onValueChange={handlePlantChange}>
                <SelectTrigger className="w-full bg-black/50 border-blue-400/30 text-white hover:border-blue-400/60 focus:border-blue-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-blue-400/30 backdrop-blur-md">
                  {PLANT_OPTIONS.map((plant) => (
                    <SelectItem 
                      key={plant} 
                      value={plant}
                      className="text-white hover:bg-blue-500/20 focus:bg-blue-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${PLANT_COLORS[plant]}`} />
                        <span>{plant}</span>
                        {plant === defaultPlant && (
                          <Badge variant="secondary" className="text-xs bg-blue-500/30 text-blue-200 border-blue-400/50">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cross-Plant Warning Banner */}
        {isCrossPlantOrder && (
          <Alert className="border-orange-400/60 bg-orange-500/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              You're ordering from <strong className="text-orange-300">{currentPlant}</strong> instead of your default plant (<strong className="text-orange-300">{defaultPlant}</strong>).
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 ml-2 text-orange-300 underline hover:text-orange-200"
                onClick={() => confirmPlantSwitch(defaultPlant)}
              >
                Switch back to default
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && pendingPlant && (
          <Alert className="border-blue-400/60 bg-blue-500/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <div className="space-y-3">
                <p>
                  You're switching from <strong className="text-blue-300">{currentPlant}</strong> to <strong className="text-blue-300">{pendingPlant}</strong>. 
                  This will affect which plant processes your orders.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => confirmPlantSwitch(pendingPlant)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-400/50"
                  >
                    Confirm Switch
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={cancelSwitch}
                    className="border-gray-400/50 text-gray-300 hover:bg-gray-800/50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}