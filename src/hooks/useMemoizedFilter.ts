
import { useMemo } from 'react';

export function useMemoizedFilter<T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [items, searchTerm, filterFn]);
}
