import React from 'react';
import { FilterBar } from './FilterBar';
import { FILTER_CONFIG, FilterType, MapFilters } from '../types/mapFilters';

interface MapFilterBarProps {
  filters: MapFilters;
  onToggleFilter: (filterType: FilterType) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

/**
 * Map-specific filter bar component.
 * Thin wrapper around the generic FilterBar component.
 */
export function MapFilterBar({
  filters,
  onToggleFilter,
  onClearAll,
  hasActiveFilters,
}: MapFilterBarProps) {
  const getFilterActiveState = (filters: MapFilters, filterType: FilterType): boolean => {
    switch (filterType) {
      case 'favourites':
        return filters.favourites;
      case 'openNow':
        return filters.openNow;
      default:
        return false;
    }
  };

  return (
    <FilterBar
      filters={filters}
      filterConfig={FILTER_CONFIG}
      onToggleFilter={onToggleFilter}
      onClearAll={onClearAll}
      hasActiveFilters={hasActiveFilters}
      getFilterActiveState={getFilterActiveState}
      settings={{
        transparent: true,
        useSafeArea: false,
        showClearAll: true,
        horizontal: true,
      }}
    />
  );
}
