import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Truck, Wrench } from 'lucide-react';

interface OrderTypeSelectorProps {
  selectedType: 'transfer' | 'mto';
  onTypeChange: (type: 'transfer' | 'mto') => void;
}

export function OrderTypeSelector({ selectedType, onTypeChange }: OrderTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Type</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedType} 
          onValueChange={(value: 'transfer' | 'mto') => onTypeChange(value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer" className="flex items-center gap-3 cursor-pointer flex-1">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Transfer Order</div>
                <div className="text-sm text-gray-500">Standard inventory transfer between locations</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RadioGroupItem value="mto" id="mto" />
            <Label htmlFor="mto" className="flex items-center gap-3 cursor-pointer flex-1">
              <Wrench className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">MTO Order</div>
                <div className="text-sm text-gray-500">Made-to-order retread production</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}