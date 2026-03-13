import { useMemo } from 'react';
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
  // Define the fetch function specific to filtered cafes
  const fetchCafes = useMemo(
    () => (signal?: AbortSignal) => apiService.getFilteredCafes(filters, signal),
    [filters]
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
