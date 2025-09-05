import React, { createContext, useContext, useState, useCallback } from 'react';

interface ElementStyles {
  background?: string;
  color?: string;
  borderRadius?: string;
  borderColor?: string;
}

interface LiveEditContextType {
  editedStyles: Record<string, ElementStyles>;
  updateStyle: (elementId: string, property: string, value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  selectedElement: string | null;
  setSelectedElement: (elementId: string | null) => void;
}

const LiveEditContext = createContext<LiveEditContextType | undefined>(undefined);

export function LiveEditProvider({ children }: { children: React.ReactNode }) {
  const [editedStyles, setEditedStyles] = useState<Record<string, ElementStyles>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const updateStyle = useCallback((elementId: string, property: string, value: string) => {
    setEditedStyles(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        [property]: value
      }
    }));
  }, []);

  return (
    <LiveEditContext.Provider value={{
      editedStyles,
      updateStyle,
      isEditing,
      setIsEditing,
      selectedElement,
      setSelectedElement
    }}>
      {children}
    </LiveEditContext.Provider>
  );
}

export function useLiveEdit() {
  const context = useContext(LiveEditContext);
  if (context === undefined) {
    throw new Error('useLiveEdit must be used within a LiveEditProvider');
  }
  return context;
}