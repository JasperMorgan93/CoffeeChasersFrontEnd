export type FilterType = 'favourites' | 'openNow';
// Future filter types can be added here:
// | 'rating' | 'distance' | 'price';

export interface FilterOption {
  id: string;
  label: string;
  type: FilterType;
  isActive: boolean;
}

export interface MapFilters {
  favourites: boolean;
  openNow: boolean;
  // Future filters can be added here:
  // minRating?: number;
  // maxDistance?: number;
  // priceRange?: [number, number];
}

/**
 * Configuration for all available filter types.
 * Add new filter types here to automatically include them in the UI.
 */
export const FILTER_CONFIG: Record<FilterType, Omit<FilterOption, 'id' | 'isActive'>> = {
  favourites: {
    label: 'Favourites',
    type: 'favourites',
  },
  openNow: {
    label: 'Open Now',
    type: 'openNow',
  },
  // Future filter types can be added here:
  // rating: {
  //   label: 'Highly Rated',
  //   type: 'rating',
  // },
  // distance: {
  //   label: 'Nearby',
  //   type: 'distance',
  // },
  // price: {
  //   label: 'Budget Friendly',
  //   type: 'price',
  // },
} as const;

export const getDefaultFilters = (): MapFilters => ({
  favourites: false,
  openNow: false,
});

export const isAnyFilterActive = (filters: MapFilters): boolean => {
  return Object.values(filters).some((value) => (typeof value === 'boolean' ? value : false));
};
