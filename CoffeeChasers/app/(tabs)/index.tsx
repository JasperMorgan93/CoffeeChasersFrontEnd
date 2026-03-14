import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPlaceholder } from '../../components/MapPlaceholder';
import { MapFilterBar } from '../../components/MapFilterBar';
import { AppButton } from '../../components/AppButton';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useCafes } from '../../hooks/useCafes';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Cafe } from '../../types/cafe';

const DEV_CAFE_ID = 'dev-cafe-1';
const DEV_CAFE_NAME = 'Dev Cafe';
const DEV_CAFE_RATING = '4.6';
const DEV_CAFE_ADDRESS = '123 Bean Street, Wellington';
const DEV_CAFE_WEBSITE = 'https://coffeechasers.example/dev-cafe';
const DEV_CAFE_OPENING_HOURS =
  'Monday: 7:00 AM - 4:00 PM|Tuesday: 7:00 AM - 4:00 PM|Wednesday: 7:00 AM - 4:00 PM|Thursday: 7:00 AM - 6:00 PM|Friday: 7:00 AM - 6:00 PM|Saturday: 8:00 AM - 6:00 PM|Sunday: 8:00 AM - 3:00 PM';

export default function Index() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [overlayHeight, setOverlayHeight] = useState(0);
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

  const isListView = viewMode === 'list';
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'map' ? 'list' : 'map'));
  }, []);

  const handleOverlayLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setOverlayHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight));
  }, []);

  const listTopPadding =
    overlayHeight > 0 ? overlayHeight + TYPOGRAPHY.spacing.sm : TYPOGRAPHY.spacing.xl * 5;

  const renderCafeItem = useCallback(
    ({ item }: { item: Cafe }) => (
      <Pressable
        onPress={() => handleCafeSelect(item.id)}
        style={({ pressed }) => [styles.cafeCard, pressed && styles.cafeCardPressed]}
      >
        <View style={styles.cafeCardHeader}>
          <Text style={styles.cafeName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cafeRating}>{item.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.cafeAddress} numberOfLines={2}>
          {item.address}
        </Text>
        <Text style={styles.cafeStatus}>{item.isOpen ? 'Open now' : 'Closed'}</Text>
      </Pressable>
    ),
    [handleCafeSelect]
  );

  return (
    <View style={styles.container}>
      {isListView ? (
        <FlatList
          data={cafes}
          keyExtractor={(item) => item.id}
          renderItem={renderCafeItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: TYPOGRAPHY.spacing.xl,
            },
          ]}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.listStateContainer}>
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
                <Text style={styles.listStateText}>Loading cafes...</Text>
              </View>
            ) : (
              <View style={styles.listStateContainer}>
                <Text style={styles.listStateText}>No cafes found for these filters.</Text>
              </View>
            )
          }
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              <View style={{ height: listTopPadding }} />
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>
          }
        />
      ) : (
        <MapPlaceholder onSelectCafe={handleCafeSelect} />
      )}

      <View style={styles.filterOverlay} onLayout={handleOverlayLayout}>
        <MapFilterBar
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      <View style={styles.floatingToggleContainer}>
        <AppButton
          label={isListView ? 'Show map' : 'Show list'}
          onPress={toggleViewMode}
          style={styles.viewModeButton}
          textStyle={styles.viewModeButtonText}
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
  floatingToggleContainer: {
    position: 'absolute',
    right: TYPOGRAPHY.spacing.md,
    bottom: TYPOGRAPHY.spacing.xl,
    zIndex: 15,
  },
  viewModeButton: {
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
  },
  viewModeButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  listContent: {
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    gap: TYPOGRAPHY.spacing.sm,
  },
  cafeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: TYPOGRAPHY.border_radius.card,
    padding: TYPOGRAPHY.spacing.md,
    gap: TYPOGRAPHY.spacing.xs,
  },
  cafeCardPressed: {
    opacity: 0.85,
  },
  cafeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: TYPOGRAPHY.spacing.sm,
  },
  cafeName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  cafeRating: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  cafeAddress: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  cafeStatus: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  listStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.xl,
    gap: TYPOGRAPHY.spacing.sm,
  },
  listStateText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  listHeaderContainer: {
    gap: TYPOGRAPHY.spacing.sm,
  },
  errorContainer: {
    backgroundColor: COLORS.overlay,
    borderRadius: TYPOGRAPHY.border_radius.card,
    padding: TYPOGRAPHY.spacing.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.background,
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
