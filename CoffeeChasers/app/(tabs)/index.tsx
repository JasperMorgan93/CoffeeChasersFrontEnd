import { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPlaceholder } from '../../components/MapPlaceholder';
import { MapFilterBar } from '../../components/MapFilterBar';
import { AppButton } from '../../components/AppButton';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useCafes } from '../../hooks/useCafes';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const DEV_CAFE_ID = 'dev-cafe-1';
const DEV_CAFE_NAME = 'Dev Cafe';
const DEV_CAFE_RATING = '4.6';
const DEV_CAFE_ADDRESS = '123 Bean Street, Wellington';
const DEV_CAFE_WEBSITE = 'https://coffeechasers.example/dev-cafe';
const DEV_CAFE_OPENING_HOURS =
  'Monday: 7:00 AM - 4:00 PM|Tuesday: 7:00 AM - 4:00 PM|Wednesday: 7:00 AM - 4:00 PM|Thursday: 7:00 AM - 6:00 PM|Friday: 7:00 AM - 6:00 PM|Saturday: 8:00 AM - 6:00 PM|Sunday: 8:00 AM - 3:00 PM';

export default function Index() {
  const router = useRouter();
  const { filters, toggleFilter, clearAllFilters, hasActiveFilters } = useMapFilters();

  // This will automatically refetch when filters change
  const { cafes, isLoading, error } = useCafes(filters);

  const handleCafeSelect = useCallback(
    (cafeId: string) => {
      router.push({
        pathname: '/cafe/[id]',
        params: { id: cafeId },
      });
    },
    [router]
  );

  const handleOpenDevCafe = useCallback(() => {
    router.push({
      pathname: '/cafe/[id]',
      params: {
        id: DEV_CAFE_ID,
        name: DEV_CAFE_NAME,
        rating: DEV_CAFE_RATING,
        address: DEV_CAFE_ADDRESS,
        website: DEV_CAFE_WEBSITE,
        openingHours: DEV_CAFE_OPENING_HOURS,
      },
    });
  }, [router]);

  return (
    <View style={styles.container}>
      <MapPlaceholder onSelectCafe={handleCafeSelect} />
      <View style={styles.filterOverlay}>
        <MapFilterBar
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      {__DEV__ && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>Cafes loaded: {cafes.length}</Text>
          <Text style={styles.debugText}>Loading: {isLoading.toString()}</Text>
          {error && <Text style={styles.debugError}>Error: {error}</Text>}
          <AppButton
            label="Open Cafe Page"
            onPress={handleOpenDevCafe}
            style={styles.debugButton}
          />
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
  debugButton: {
    marginTop: TYPOGRAPHY.spacing.sm,
  },
});
