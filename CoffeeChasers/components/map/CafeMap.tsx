import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
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

export function CafeMap({ cafes, isLoading, error, onSelectCafe, onSearchArea, isSearchingArea }: CafeMapProps) {
  const { centerCoordinate, cafesWithCoordinates } = useCafeMapData(cafes);
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

    const loadUserCoordinate = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) {
          return;
        }

        const { longitude, latitude } = location.coords;
        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
          setUserCoordinate([longitude, latitude]);
        }
      } catch (locationError) {
        console.warn('Unable to read current user location.', locationError);
      }
    };

    loadUserCoordinate();

    return () => {
      isMounted = false;
    };
  }, []);

  const mapCenterCoordinate = useMemo(
    () => userCoordinate ?? centerCoordinate,
    [centerCoordinate, userCoordinate]
  );

  const handleCameraChanged = useCallback(() => {
    if (!isLoading) {
      setShowSearchButton(true);
    }
  }, [isLoading]);

  const handleSearchArea = useCallback(() => {
    setShowSearchButton(false);
    onSearchArea?.();
  }, [onSearchArea]);

  const handleMapPress = useCallback(() => {
    setSelectedCafeId(null);
  }, []);

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
        <Mapbox.Camera zoomLevel={12} centerCoordinate={mapCenterCoordinate} animationMode="flyTo" />

        {cafesWithCoordinates.map((cafe) => (
          <Mapbox.PointAnnotation
            key={cafe.id}
            id={cafe.id}
            coordinate={[cafe.longitude, cafe.latitude]}
            onSelected={() => {
              setSelectedCafeId((currentCafeId) => {
                if (currentCafeId === cafe.id) {
                  onSelectCafe?.(cafe.id);
                  return currentCafeId;
                }

                return cafe.id;
              });
            }}
            onDeselected={() => setSelectedCafeId((currentId) => (currentId === cafe.id ? null : currentId))}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{cafe.rating.toFixed(1)}</Text>
            </View>
            <View
              style={[
                styles.selectedCafeLabel,
                selectedCafeId === cafe.id ? styles.selectedCafeLabelVisible : styles.selectedCafeLabelHidden,
              ]}
            >
              <Text numberOfLines={1} style={styles.selectedCafeLabelText}>
                {cafe.name}
              </Text>
            </View>
          </Mapbox.PointAnnotation>
        ))}
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
      <Ionicons name="map-outline" size={64} color={COLORS.textPrimaryMuted} />
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
  markerContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.sm,
  },
  markerText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  selectedCafeLabel: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: TYPOGRAPHY.spacing.xs,
    alignSelf: 'center',
    maxWidth: 180,
    borderRadius: TYPOGRAPHY.border_radius.card,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textPrimary,
  },
  selectedCafeLabelVisible: {
    opacity: 1,
  },
  selectedCafeLabelHidden: {
    opacity: 0,
  },
  selectedCafeLabelText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
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
