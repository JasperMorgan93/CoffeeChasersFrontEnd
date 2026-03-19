/**
 * Generic filter system types that can be reused across the app
 */

export interface BaseFilterOption<T = string> {
  id: string;
  label: string;
  type: T;
  isActive: boolean;
}

export interface FilterConfig<T = string> {
  label: string;
  type: T;
}

export interface FilterBarSettings {
  showClearAll?: boolean;
  horizontal?: boolean;
  transparent?: boolean;
  useSafeArea?: boolean;
}

export interface FilterBarProps<T = string, F = Record<string, any>> {
  filters: F;
  filterConfig: Record<T extends string ? T : string, FilterConfig<T>>;
  onToggleFilter: (filterType: T) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  getFilterActiveState: (filters: F, filterType: T) => boolean;
  settings?: FilterBarSettings;
}
