import { useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { useAsyncData } from './useAsyncData';
import { MapFilters } from '../types/mapFilters';
import { Cafe } from '../types/cafe';

interface UseCafesResult {
  cafes: Cafe[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Hook for managing filtered cafe data based on current map filters.
 * Uses the generic useAsyncData hook and only contains business logic specific to cafes.
 */
export function useCafes(filters: MapFilters): UseCafesResult {
  // Keep latest filters in a ref so fetchCafes is stable and never triggers
  // an automatic re-fetch when filters change. Filters are applied at call time.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchCafes = useCallback(
    (signal?: AbortSignal) => apiService.getFilteredCafes(filtersRef.current, signal),
    []
  );

  // Use the generic async data hook with cafe-specific fetch function
  const {
    data: cafes = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAsyncData({
    fetchFn: fetchCafes,
    initialData: [],
    autoFetch: true,
  });

  return {
    cafes,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
