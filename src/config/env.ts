const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const API_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
);

export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';
