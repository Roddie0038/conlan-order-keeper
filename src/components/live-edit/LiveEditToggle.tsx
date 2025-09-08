import React from 'react';
import { Button } from '../ui/button';
import { Edit3, X } from 'lucide-react';
import { useLiveEdit } from '../../contexts/LiveEditContext';
export function LiveEditToggle() {
  const {
    isEditing,
    setIsEditing,
    setSelectedElement
  } = useLiveEdit();
  const toggleEditing = () => {
    if (isEditing) {
      setSelectedElement(null);
    }
    setIsEditing(!isEditing);
  };
  return (
    <Button
      onClick={toggleEditing}
      variant={isEditing ? "destructive" : "outline"}
      size="sm"
      className="fixed top-4 right-4 z-50"
    >
      {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
    </Button>
  );
}