import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPlaceholder } from '../../components/MapPlaceholder';
import { MapFilterBar } from '../../components/MapFilterBar';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useCafes } from '../../hooks/useCafes';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export default function Index() {
  const router = useRouter();
  const { filters, toggleFilter, clearAllFilters, hasActiveFilters } = useMapFilters();
  
  // This will automatically refetch when filters change
  const { cafes, isLoading, error } = useCafes(filters);

  return (
    <View style={styles.container}>
      <MapPlaceholder />
      <View style={styles.filterOverlay}>
        <MapFilterBar 
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </View>
      
      {/* Debug info to show filter status (remove when implementing real map) */}
      {__DEV__ && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>
            Filters: {JSON.stringify(filters, null, 2)}
          </Text>
          <Text style={styles.debugText}>
            Cafes loaded: {cafes.length} | Loading: {isLoading.toString()}
          </Text>
          {error && <Text style={styles.debugError}>Error: {error}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  debugOverlay: {
    position: 'absolute',
    bottom: TYPOGRAPHY.spacing.lg,
    left: TYPOGRAPHY.spacing.lg,
    right: TYPOGRAPHY.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: TYPOGRAPHY.spacing.md,
    borderRadius: 8,
    zIndex: 20,
  },
  debugText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#fff',
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  debugError: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#ff4444',
  },
});

