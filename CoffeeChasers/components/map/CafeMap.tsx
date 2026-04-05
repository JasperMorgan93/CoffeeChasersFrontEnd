import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import RatingBeanIcon from '../RatingBeanIcon';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';
import { Cafe } from '../../types/cafe';
import { useCafeMapData } from '../../hooks/useCafeMapData';
import { hasMapboxAccessToken, initializeMapbox } from '../../services/mapbox';

interface CafeMapProps {
  cafes: Cafe[];
  isLoading: boolean;
  error: string | null;
  onSelectCafe?: (cafeId: string) => void;
  onSearchArea?: () => void;
  isSearchingArea?: boolean;
}

const INITIAL_ZOOM_LEVEL = 15;
const MARKER_VISIBILITY_ZOOM_LEVEL = 13.25;
const MIN_MARKER_BEAN_SIZE = 18;
const MAX_MARKER_BEAN_SIZE = 34;
const MAX_MARKER_SCALE_ZOOM_LEVEL = 17.5;

export function CafeMap({
  cafes,
  isLoading,
  error,
  onSelectCafe,
  onSearchArea,
  isSearchingArea,
}: CafeMapProps) {
  const { centerCoordinate, cafesWithCoordinates } = useCafeMapData(cafes);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(INITIAL_ZOOM_LEVEL);
  const [hasSearchAreaOverride, setHasSearchAreaOverride] = useState(false);
  const [userCoordinate, setUserCoordinate] = useState<[number, number] | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

  useEffect(() => {
    initializeMapbox();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isMounted = true;

    const updateUserCoordinate = ({
      longitude,
      latitude,
    }: {
      longitude: number;
      latitude: number;
    }) => {
      if (!isMounted) {
        return;
      }

      if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
        setUserCoordinate([longitude, latitude]);
      }
    };

    const loadUserCoordinate = async () => {
      let locationSubscription: Location.LocationSubscription | null = null;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const hasPermission = status === Location.PermissionStatus.GRANTED;

        if (!isMounted) {
          return;
        }

        setHasLocationPermission(hasPermission);

        if (!hasPermission) {
          setUserCoordinate(null);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        updateUserCoordinate(location.coords);

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          ({ coords }) => {
            updateUserCoordinate(coords);
          }
        );

        if (!isMounted) {
          locationSubscription.remove();
        }
      } catch (locationError) {
        if (isMounted) {
          setHasLocationPermission(false);
        }

        console.warn('Unable to read current user location.', locationError);
      }

      return () => {
        locationSubscription?.remove();
      };
    };

    let cleanupLocationSubscription: (() => void) | undefined;

    void loadUserCoordinate().then((cleanup) => {
      cleanupLocationSubscription = cleanup;
    });

    return () => {
      isMounted = false;
      cleanupLocationSubscription?.();
    };
  }, []);

  const mapCenterCoordinate = useMemo(
    () => userCoordinate ?? centerCoordinate,
    [centerCoordinate, userCoordinate]
  );

  const areCafeMarkersVisible =
    currentZoomLevel >= MARKER_VISIBILITY_ZOOM_LEVEL || hasSearchAreaOverride;

  const markerBeanSize = useMemo(() => {
    const zoomRange = MAX_MARKER_SCALE_ZOOM_LEVEL - MARKER_VISIBILITY_ZOOM_LEVEL;

    if (zoomRange <= 0) {
      return MAX_MARKER_BEAN_SIZE;
    }

    const normalizedZoom = (currentZoomLevel - MARKER_VISIBILITY_ZOOM_LEVEL) / zoomRange;
    const zoomProgress = Math.max(0, Math.min(1, normalizedZoom));

    return Math.round(
      MIN_MARKER_BEAN_SIZE + (MAX_MARKER_BEAN_SIZE - MIN_MARKER_BEAN_SIZE) * zoomProgress
    );
  }, [currentZoomLevel]);

  const markerPadding = useMemo(() => {
    return Math.max(3, Math.round(markerBeanSize * 0.16));
  }, [markerBeanSize]);

  const handleCameraChanged = useCallback(
    (state: {
      properties?: { zoom?: number };
      gestures?: { isGestureActive?: boolean };
    }) => {
      const zoom = state.properties?.zoom;

      if (typeof zoom === 'number' && Number.isFinite(zoom)) {
        setCurrentZoomLevel(zoom);

        if (zoom < MARKER_VISIBILITY_ZOOM_LEVEL && hasSearchAreaOverride) {
          setSelectedCafeId(null);
          setHasSearchAreaOverride(false);
        }
      }

      if (state.gestures?.isGestureActive) {
        if (!isLoading) {
          setShowSearchButton(true);
        }
      }
    },
    [hasSearchAreaOverride, isLoading]
  );

  const handleSearchArea = useCallback(() => {
    setShowSearchButton(false);
    setHasSearchAreaOverride(true);
    onSearchArea?.();
  }, [onSearchArea]);

  const handleMapPress = useCallback(() => {
    setSelectedCafeId(null);
  }, []);

  const handleRecenterToUser = useCallback(() => {
    if (!userCoordinate || !cameraRef.current) {
      return;
    }

    cameraRef.current.setCamera({
      centerCoordinate: userCoordinate,
      zoomLevel: 13,
      animationMode: 'flyTo',
      animationDuration: 700,
    });
  }, [userCoordinate]);

  if (Platform.OS === 'web') {
    return (
      <MapFallback
        title="Map view is available on iOS and Android"
        subtitle="React Native Mapbox requires a native build."
      />
    );
  }

  if (!hasMapboxAccessToken) {
    return (
      <MapFallback
        title="Mapbox access token missing"
        subtitle="Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your env file."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onCameraChanged={handleCameraChanged}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={INITIAL_ZOOM_LEVEL}
          centerCoordinate={mapCenterCoordinate}
          animationMode="flyTo"
        />

        {hasLocationPermission ? (
          <Mapbox.LocationPuck
            visible
            puckBearing="heading"
            puckBearingEnabled
            pulsing={{
              isEnabled: true,
              color: COLORS.textPrimaryMuted,
              radius: 48,
            }}
          />
        ) : null}

        {areCafeMarkersVisible
          ? cafesWithCoordinates.map((cafe) => {
              return (
                <Mapbox.MarkerView
                  key={cafe.id}
                  coordinate={[cafe.longitude, cafe.latitude]}
                  anchor={{ x: 0.5, y: 1 }}
                  allowOverlap
                  allowOverlapWithPuck
                >
                  <Pressable
                    onPress={() => {
                      setSelectedCafeId((currentCafeId) => {
                        if (currentCafeId === cafe.id) {
                          onSelectCafe?.(cafe.id);
                          return currentCafeId;
                        }

                        return cafe.id;
                      });
                    }}
                    style={({ pressed }) => [styles.annotationContainer, pressed && styles.markerPressed]}
                  >
                    {selectedCafeId === cafe.id ? (
                      <View style={styles.selectedCafeLabel}>
                        <Text numberOfLines={2} style={styles.selectedCafeLabelText}>
                          {cafe.name}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.markerContainer}>
                      <View
                        style={[
                          styles.markerRoastFill,
                          {
                            paddingVertical: markerPadding,
                            paddingHorizontal: markerPadding,
                          },
                          selectedCafeId === cafe.id && styles.markerRoastFillSelected,
                        ]}
                      >
                        <RatingBeanIcon rating={cafe.rating} size={markerBeanSize} />
                      </View>
                    </View>
                  </Pressable>
                </Mapbox.MarkerView>
              );
            })
          : null}
      </Mapbox.MapView>

      {showSearchButton && !isLoading ? (
        <View style={styles.searchButtonContainer}>
          <Pressable
            style={[styles.searchButton, isSearchingArea && styles.searchButtonDisabled]}
            onPress={handleSearchArea}
            disabled={isSearchingArea}
          >
            {isSearchingArea ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.searchButtonText}>Search this area</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.recenterButtonContainer}>
        <Pressable
          style={[styles.recenterButton, !userCoordinate && styles.recenterButtonDisabled]}
          onPress={handleRecenterToUser}
          disabled={!userCoordinate}
        >
          <Ionicons name="locate" size={UI.map.recenterButtonIconSize} color={COLORS.background} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.background} />
          <Text style={styles.loadingText}>Loading cafes...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

interface MapFallbackProps {
  title: string;
  subtitle: string;
}

function MapFallback({ title, subtitle }: MapFallbackProps) {
  return (
    <View style={styles.fallbackContainer}>
      <Ionicons name="map-outline" size={UI.placeholder.mapIconSize} color={COLORS.textPrimaryMuted} />
      <Text style={styles.fallbackLabel}>{title}</Text>
      <Text style={styles.fallbackSublabel}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  annotationContainer: {
    alignItems: 'center',
  },
  markerPressed: {
    opacity: 0.9,
  },
  markerContainer: {
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    overflow: 'hidden',
  },
  markerRoastFill: {
    borderWidth: 1,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    borderColor: COLORS.textPrimaryMuted,
    backgroundColor: COLORS.surface,
  },
  markerRoastFillSelected: {
    borderColor: COLORS.textPrimary,
  },
  selectedCafeLabel: {
    marginBottom: TYPOGRAPHY.spacing.xs,
    maxWidth: 220,
    minWidth: 96,
    borderRadius: TYPOGRAPHY.border_radius.card,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
  },
  selectedCafeLabelText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
  searchButtonContainer: {
    position: 'absolute',
    top: TYPOGRAPHY.spacing.xl * 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    minWidth: 56,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  recenterButtonContainer: {
    position: 'absolute',
    right: TYPOGRAPHY.spacing.md,
    top: TYPOGRAPHY.spacing.xl * 8,
    zIndex: UI.map.recenterButtonZIndex,
    elevation: UI.map.recenterButtonElevation,
  },
  recenterButton: {
    width: UI.map.recenterButtonSize,
    height: UI.map.recenterButtonSize,
    borderRadius: UI.map.recenterButtonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  recenterButtonDisabled: {
    opacity: 0.45,
  },
  loadingOverlay: {
    position: 'absolute',
    left: TYPOGRAPHY.spacing.md,
    right: TYPOGRAPHY.spacing.md,
    bottom: TYPOGRAPHY.spacing.xl,
    backgroundColor: COLORS.overlay,
    borderRadius: TYPOGRAPHY.border_radius.card,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: TYPOGRAPHY.spacing.xs,
  },
  loadingText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  errorOverlay: {
    position: 'absolute',
    left: TYPOGRAPHY.spacing.md,
    right: TYPOGRAPHY.spacing.md,
    bottom: TYPOGRAPHY.spacing.xl * 2.5,
    backgroundColor: COLORS.overlay,
    borderRadius: TYPOGRAPHY.border_radius.card,
    padding: TYPOGRAPHY.spacing.sm,
  },
  errorText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.xl,
  },
  fallbackLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  fallbackSublabel: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
    textAlign: 'center',
  },
});
