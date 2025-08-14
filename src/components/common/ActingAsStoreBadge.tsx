import React from 'react';
import { hasFullStoreAccess } from '@/lib/roles';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ActingAsStoreBadgeProps {
  orderingStore?: string | null;
  className?: string;
}

export function ActingAsStoreBadge({ orderingStore, className = '' }: ActingAsStoreBadgeProps) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);

  if (!elevated || !orderingStore) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" className="text-xs">
        Acting as: <span className="font-semibold ml-1">{orderingStore}</span>
      </Badge>
    </div>
  );
}