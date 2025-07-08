import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Grid3X3 } from 'lucide-react';

interface Dashboard3DToggleProps {
  is3DMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export function Dashboard3DToggle({ is3DMode, onToggle }: Dashboard3DToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={is3DMode ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!is3DMode)}
        className="flex items-center gap-2"
      >
        {is3DMode ? (
          <>
            <Box className="h-4 w-4" />
            3D View
          </>
        ) : (
          <>
            <Grid3X3 className="h-4 w-4" />
            2D View
          </>
        )}
      </Button>
      
      {is3DMode && (
        <Badge variant="secondary" className="text-xs">
          Experimental
        </Badge>
      )}
    </div>
  );
}