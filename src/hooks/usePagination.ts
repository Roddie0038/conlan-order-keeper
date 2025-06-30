
import { useState, useMemo } from 'react';

interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function usePagination<T>(items: T[], config: PaginationConfig = {}) {
  const { initialPage = 1, initialPageSize = 10 } = config;
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    totalCount: items.length,
    totalPages: Math.ceil(items.length / initialPageSize)
  });

  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return items.slice(start, end);
  }, [items, pagination.page, pagination.pageSize]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    const totalPages = Math.ceil(items.length / pageSize);
    setPagination(prev => ({
      ...prev,
      pageSize,
      totalPages,
      page: Math.min(prev.page, totalPages)
    }));
  };

  // Update pagination when items change
  useMemo(() => {
    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / pagination.pageSize);
    setPagination(prev => ({
      ...prev,
      totalCount,
      totalPages,
      page: Math.min(prev.page, totalPages || 1)
    }));
  }, [items.length, pagination.pageSize]);

  return {
    paginatedItems,
    pagination,
    goToPage,
    setPageSize
  };
}
