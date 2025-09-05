import React from 'react';
import { useLiveEdit } from '../../contexts/LiveEditContext';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

const colorPresets = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Gray', value: '#6b7280' }
];

const backgroundPresets = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#db2777' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' }
];

export function StyleEditor() {
  const { selectedElement, updateStyle, setSelectedElement, setIsEditing } = useLiveEdit();

  console.log('🎨 StyleEditor: Rendering with selectedElement:', selectedElement);

  if (!selectedElement) {
    console.log('🎨 StyleEditor: No selected element, hiding editor');
    return null;
  }

  const handleClose = () => {
    console.log('🎨 StyleEditor: Closing editor');
    setSelectedElement(null);
    setIsEditing(false);
  };

  const handleStyleUpdate = (property: string, value: string) => {
    console.log('🎨 StyleEditor: Updating style:', { selectedElement, property, value });
    try {
      updateStyle(selectedElement, property, value);
      console.log('✅ StyleEditor: Style update successful');
    } catch (error) {
      console.error('🚨 StyleEditor: Style update failed:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Edit Styles</h3>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Background Colors */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Background Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {backgroundPresets.map((preset) => (
              <button
                key={preset.name}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: preset.value }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🎨 Background color clicked:', preset.value);
              handleStyleUpdate('background', preset.value);
            }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Text Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: preset.value }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🎨 Text color clicked:', preset.value);
              handleStyleUpdate('color', preset.value);
            }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Border Radius
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'None', value: '0px' },
              { name: 'Small', value: '4px' },
              { name: 'Medium', value: '8px' },
              { name: 'Large', value: '16px' },
              { name: 'XL', value: '24px' },
              { name: 'Full', value: '9999px' }
            ].map((option) => (
              <Button
                key={option.name}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🎨 Border radius clicked:', option.value);
                  handleStyleUpdate('borderRadius', option.value);
                }}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}