import { useMemo } from 'react';
import { Cafe } from '../types/cafe';

type MapCoordinate = [number, number];

interface UseCafeMapDataResult {
    centerCoordinate: MapCoordinate;
    cafesWithCoordinates: Cafe[];
}

const FALLBACK_COORDINATE: MapCoordinate = [-0.1276, 51.5072];

const hasValidCoordinates = (cafe: Cafe): boolean =>
    Number.isFinite(cafe.latitude) && Number.isFinite(cafe.longitude);

export function useCafeMapData(cafes: Cafe[]): UseCafeMapDataResult {
    const cafesWithCoordinates = useMemo(
        () => cafes.filter(hasValidCoordinates),
        [cafes]
    );

    const centerCoordinate = useMemo<MapCoordinate>(() => {
        if (cafesWithCoordinates.length === 0) {
            return FALLBACK_COORDINATE;
        }

        const totals = cafesWithCoordinates.reduce(
            (acc, cafe) => ({
                latitude: acc.latitude + cafe.latitude,
                longitude: acc.longitude + cafe.longitude,
            }),
            { latitude: 0, longitude: 0 }
        );

        return [
            totals.longitude / cafesWithCoordinates.length,
            totals.latitude / cafesWithCoordinates.length,
        ];
    }, [cafesWithCoordinates]);

    return {
        centerCoordinate,
        cafesWithCoordinates,
    };
}
