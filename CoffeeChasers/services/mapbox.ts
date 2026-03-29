import Mapbox from '@rnmapbox/maps';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

let hasInitializedMapbox = false;

export const hasMapboxAccessToken = MAPBOX_ACCESS_TOKEN.length > 0;

export function initializeMapbox(): void {
    if (hasInitializedMapbox || !hasMapboxAccessToken) {
        return;
    }

    Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
    hasInitializedMapbox = true;
}
