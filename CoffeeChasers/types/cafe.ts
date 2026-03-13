export interface Cafe {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    isFavourite: boolean;
    isOpen: boolean;
    openingHours?: {
        [day: string]: { open: string; close: string } | null;
    };
}

export interface CafeFilters {
    favourites?: boolean;
    openNow?: boolean;
    minRating?: number;
    maxDistance?: number;
    priceRange?: [number, number];
}