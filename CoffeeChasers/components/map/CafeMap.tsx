import { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
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
}

export function CafeMap({ cafes, isLoading, error, onSelectCafe }: CafeMapProps) {
  const { centerCoordinate, cafesWithCoordinates } = useCafeMapData(cafes);

  useEffect(() => {
    initializeMapbox();
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
      <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        <Mapbox.Camera zoomLevel={12} centerCoordinate={centerCoordinate} animationMode="flyTo" />

        {cafesWithCoordinates.map((cafe) => (
          <Mapbox.PointAnnotation
            key={cafe.id}
            id={cafe.id}
            coordinate={[cafe.longitude, cafe.latitude]}
            onSelected={() => onSelectCafe?.(cafe.id)}
          >
            <Pressable onPress={() => onSelectCafe?.(cafe.id)} style={styles.markerContainer}>
              <Text style={styles.markerText}>{cafe.rating.toFixed(1)}</Text>
            </Pressable>
            <Mapbox.Callout title={cafe.name} />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

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
