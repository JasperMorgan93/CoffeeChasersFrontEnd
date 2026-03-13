import { useState, useCallback } from 'react';
import { MapFilters, FilterType, getDefaultFilters } from '../types/mapFilters';

interface UseMapFiltersResult {
  filters: MapFilters;
  toggleFilter: (filterType: FilterType) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing map filter state.
 */
export function useMapFilters(): UseMapFiltersResult {
  const [filters, setFilters] = useState<MapFilters>(getDefaultFilters);

  const toggleFilter = useCallback((filterType: FilterType) => {
    setFilters((prevFilters) => {
      switch (filterType) {
        case 'favourites':
          return {
            ...prevFilters,
            favourites: !prevFilters.favourites,
          };
        case 'openNow':
          return {
            ...prevFilters,
            openNow: !prevFilters.openNow,
          };
        // Future filter types can be handled here:
        // case 'rating':
        //   return { ...prevFilters, minRating: prevFilters.minRating ? undefined : 4 };
        default:
          return prevFilters;
      }
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const hasActiveFilters = Object.values(filters).some((value) =>
    typeof value === 'boolean' ? value : false
  );

  return {
    filters,
    toggleFilter,
    clearAllFilters,
    hasActiveFilters,
  };
}
