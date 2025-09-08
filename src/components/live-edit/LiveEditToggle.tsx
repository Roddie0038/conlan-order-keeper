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
  return;
}