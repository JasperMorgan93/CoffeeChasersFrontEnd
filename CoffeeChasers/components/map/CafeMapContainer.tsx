import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Cafe } from '../../types/cafe';

interface CafeMapContainerProps {
  cafes: Cafe[];
  isLoading: boolean;
  error: string | null;
  onSelectCafe?: (cafeId: string) => void;
  onSearchArea?: () => void;
  isSearchingArea?: boolean;
}

// Lazy load the actual map component only if Mapbox is available
let CafeMapComponent: React.ComponentType<CafeMapContainerProps> | null = null;
let mapboxAvailable = true;

try {
  // Try to require the map component - this will fail if native modules aren't available
  const mapModule = require('./CafeMap');
  CafeMapComponent = mapModule.CafeMap;
} catch (error) {
  // Mapbox not available, we'll use the placeholder
  mapboxAvailable = false;
  console.warn('Mapbox not available in current environment, using list view only', error);
}

function MapPlaceholder({ isLoading }: { isLoading: boolean }) {
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>Map View Unavailable</Text>
        <Text style={styles.placeholderText}>
          Mapbox is not available in this environment. Use the list view or switch to a platform with proper native support.
        </Text>
        {isLoading && <ActivityIndicator size="large" color={COLORS.textPrimary} style={styles.loader} />}
      </View>
    </View>
  );
}

export function CafeMapContainer(props: CafeMapContainerProps) {
  if (!mapboxAvailable || !CafeMapComponent) {
    return <MapPlaceholder isLoading={props.isLoading} />;
  }

  return <CafeMapComponent {...props} />;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  placeholderContent: {
    alignItems: 'center',
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
  },
  placeholderTitle: {
    fontSize: TYPOGRAPHY.fontSize.title,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.md,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
    textAlign: 'center',
    marginBottom: TYPOGRAPHY.spacing.lg,
  },
  loader: {
    marginTop: TYPOGRAPHY.spacing.lg,
  },
});
