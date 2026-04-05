import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { CafeMapContainer } from '../../components/map/CafeMapContainer';
import { MapFilterBar } from '../../components/MapFilterBar';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useCafes } from '../../hooks/useCafes';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';
import { Cafe } from '../../types/cafe';

export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  const [containerHeight, setContainerHeight] = useState(0);
  const [filterOverlayHeight, setFilterOverlayHeight] = useState(0);
  const [listScrollOffset, setListScrollOffset] = useState(0);
  const { filters, toggleFilter, clearAllFilters, hasActiveFilters } = useMapFilters();

  const expandedTop = filterOverlayHeight + SHEET_TOP_GAP;
  const maxSheetHeight = containerHeight > 0 ? containerHeight - expandedTop : SHEET_MIN_EXPANDED_HEIGHT;
  const topSnapPosition = 0;
  const bottomSnapPosition = Math.max(0, maxSheetHeight - SHEET_COLLAPSED_HEIGHT);

  const hasInitializedRef = useRef(false);
  const bottomSnapPositionRef = useRef(0);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const currentSheetTranslateYRef = useRef(0);
  const panStartTranslateYRef = useRef(0);

  const { cafes, isLoading, error, refetch, isRefetching } = useCafes(filters);

  const handleCafeSelect = useCallback(
    (cafeId: string) => {
      router.push({
        pathname: '/cafe/[id]',
        params: { id: cafeId },
      });
    },
    [router]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    // Only initialize once when both dimensions are measured
    if (containerHeight === 0 || filterOverlayHeight === 0 || hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    const calculatedBottomSnapPosition = Math.max(0, maxSheetHeight - SHEET_COLLAPSED_HEIGHT);
    bottomSnapPositionRef.current = calculatedBottomSnapPosition;
    sheetTranslateY.setValue(calculatedBottomSnapPosition);
    currentSheetTranslateYRef.current = calculatedBottomSnapPosition;
    panStartTranslateYRef.current = calculatedBottomSnapPosition;
  }, [containerHeight, filterOverlayHeight, sheetTranslateY, maxSheetHeight]);

  useEffect(() => {
    const listenerId = sheetTranslateY.addListener(({ value }) => {
      currentSheetTranslateYRef.current = value;
    });

    return () => {
      sheetTranslateY.removeListener(listenerId);
    };
  }, [sheetTranslateY]);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  }, []);

  const handleFilterOverlayLayout = useCallback((event: LayoutChangeEvent) => {
    setFilterOverlayHeight(event.nativeEvent.layout.height);
  }, []);

  const handleListScroll = useCallback((event: any) => {
    setListScrollOffset(event.nativeEvent.contentOffset.y);
  }, []);

  const animateToSnap = useCallback(
    (targetPosition: number) => {
      Animated.spring(sheetTranslateY, {
        toValue: targetPosition,
        useNativeDriver: true,
        tension: 68,
        friction: 11,
      }).start(() => {
        panStartTranslateYRef.current = targetPosition;
        currentSheetTranslateYRef.current = targetPosition;
      });
    },
    [sheetTranslateY]
  );

  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isVerticalDrag = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        return isVerticalDrag && Math.abs(gestureState.dy) > 3;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        sheetTranslateY.stopAnimation();
        panStartTranslateYRef.current = currentSheetTranslateYRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.max(
          topSnapPosition,
          Math.min(bottomSnapPositionRef.current, panStartTranslateYRef.current + gestureState.dy)
        );
        sheetTranslateY.setValue(nextValue);
        currentSheetTranslateYRef.current = nextValue;
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentTranslateY = currentSheetTranslateYRef.current;
        const gestureDistance = Math.abs(gestureState.dy);
        const isMovingUp = gestureState.vy < 0;
        const isMovingDown = gestureState.vy > 0;
        const isAtTopOfList = listScrollOffset <= 0;
        const snapThreshold = bottomSnapPositionRef.current * 0.2;

        // If moving up, snap to top
        if (isMovingUp) {
          animateToSnap(topSnapPosition);
          return;
        }

        // If at top of list, moving down, and dragged past 20% threshold, snap to bottom
        if (isAtTopOfList && isMovingDown && gestureDistance > snapThreshold) {
          animateToSnap(bottomSnapPositionRef.current);
          return;
        }

        // Otherwise, snap to nearest position
        const distanceToTop = Math.abs(currentTranslateY - topSnapPosition);
        const distanceToBottom = Math.abs(currentTranslateY - bottomSnapPositionRef.current);
        const nearestSnap = distanceToTop < distanceToBottom ? topSnapPosition : bottomSnapPositionRef.current;
        animateToSnap(nearestSnap);
      },
      onPanResponderTerminate: (_, gestureState) => {
        const currentTranslateY = currentSheetTranslateYRef.current;
        const distanceToTop = Math.abs(currentTranslateY - topSnapPosition);
        const distanceToBottom = Math.abs(currentTranslateY - bottomSnapPositionRef.current);
        const nearestSnap = distanceToTop < distanceToBottom ? topSnapPosition : bottomSnapPositionRef.current;
        animateToSnap(nearestSnap);
      },
    })
  ).current;

  const sheetToggleLabel = `Drag to browse cafes (${cafes.length})`;

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
    <View style={styles.container} onLayout={handleContainerLayout}>
      <CafeMapContainer
        cafes={cafes}
        isLoading={isLoading}
        error={error}
        onSelectCafe={handleCafeSelect}
        onSearchArea={refetch}
        isSearchingArea={isRefetching}
      />

      <View style={styles.filterOverlay} onLayout={handleFilterOverlayLayout}>
        <MapFilterBar
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: maxSheetHeight,
          },
          {
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.sheetHandleGestureArea} {...sheetPanResponder.panHandlers}>
          <View style={styles.sheetHandle}>
            <View style={styles.sheetHandleBar} />
            <Text style={styles.sheetHandleText}>Drag to browse cafes ({cafes.length})</Text>
          </View>
        </View>

        <FlatList
          data={cafes}
          keyExtractor={(item) => item.id}
          renderItem={renderCafeItem}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
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
            error ? (
              <View style={styles.listHeaderContainer}>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </View>
            ) : null
          }
        />
      </Animated.View>
    </View>
  );
}

const SHEET_MIN_EXPANDED_HEIGHT = UI.homeSheet.minExpandedHeight;
const SHEET_COLLAPSED_HEIGHT = UI.homeSheet.collapsedHeight;
const SHEET_TOP_GAP = UI.homeSheet.topGap;

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
  bottomSheet: {
    position: 'absolute',
    left: UI.homeSheet.horizontalInset,
    right: UI.homeSheet.horizontalInset,
    bottom: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: TYPOGRAPHY.border_radius.round_corner,
    borderTopRightRadius: TYPOGRAPHY.border_radius.round_corner,
    borderBottomLeftRadius: TYPOGRAPHY.border_radius.round_corner,
    borderBottomRightRadius: TYPOGRAPHY.border_radius.round_corner,
    borderTopWidth: 1,
    borderColor: COLORS.textPrimaryMuted,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: COLORS.shadowBase,
    shadowOffset: UI.homeSheet.shadowOffset,
    shadowOpacity: UI.homeSheet.shadowOpacity,
    shadowRadius: UI.homeSheet.shadowRadius,
    elevation: UI.homeSheet.elevation,
  },
  sheetHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: TYPOGRAPHY.spacing.xs,
    paddingTop: TYPOGRAPHY.spacing.xs,
    paddingBottom: TYPOGRAPHY.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textPrimaryMuted,
  },
  sheetHandleGestureArea: {
    zIndex: 30,
    minHeight: UI.homeSheet.handleGestureMinHeight,
    justifyContent: 'center',
  },
  sheetHandleBar: {
    width: UI.homeSheet.handleBarWidth,
    height: UI.homeSheet.handleBarHeight,
    borderRadius: UI.homeSheet.handleBarRadius,
    backgroundColor: COLORS.textPrimaryMuted,
  },
  sheetHandleText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    paddingTop: TYPOGRAPHY.spacing.sm,
    paddingBottom: TYPOGRAPHY.spacing.xl,
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
});
