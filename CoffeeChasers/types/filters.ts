/**
 * Generic filter system types that can be reused across the app
 */

export interface BaseFilterOption<T extends string = string> {
  id: string;
  label: string;
  type: T;
  isActive: boolean;
}

export interface FilterConfig<T extends string = string> {
  label: string;
  type: T;
}

export interface FilterBarSettings {
  showClearAll?: boolean;
  horizontal?: boolean;
  transparent?: boolean;
  useSafeArea?: boolean;
}

export interface FilterBarProps<T extends string = string, F = Record<string, unknown>> {
  filters: F;
  filterConfig: Record<T, FilterConfig<T>>;
  onToggleFilter: (filterType: T) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  getFilterActiveState: (filters: F, filterType: T) => boolean;
  settings?: FilterBarSettings;
}
