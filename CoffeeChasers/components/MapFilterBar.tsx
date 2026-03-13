import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { FILTER_CONFIG, FilterType, MapFilters } from '../types/mapFilters';

interface MapFilterBarProps {
  filters: MapFilters;
  onToggleFilter: (filterType: FilterType) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

/**
 * Horizontal scrollable filter bar for map filters.
 * Automatically renders all filters defined in FILTER_CONFIG.
 */
export function MapFilterBar({ 
  filters, 
  onToggleFilter, 
  onClearAll, 
  hasActiveFilters 
}: MapFilterBarProps) {
  const insets = useSafeAreaInsets();
  
  const renderFilterChip = (filterType: FilterType) => {
    const config = FILTER_CONFIG[filterType];
    const isActive = getFilterActiveState(filters, filterType);
    
    return (
      <Pressable
        key={filterType}
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]}
        onPress={() => onToggleFilter(filterType)}
      >
        <Text style={[
          styles.filterLabel,
          isActive && styles.filterLabelActive
        ]}>
          {config.label}
        </Text>
        {isActive && (
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color={COLORS.surface} 
          />
        )}
      </Pressable>
    );
  };

  const renderClearButton = () => {
    if (!hasActiveFilters) return null;
    
    return (
      <Pressable
        style={styles.clearButton}
        onPress={onClearAll}
      >
        <Ionicons 
          name="close-circle" 
          size={16} 
          color={COLORS.textPrimaryMuted} 
        />
        <Text style={styles.clearLabel}>Clear</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + TYPOGRAPHY.spacing.sm }]}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.keys(FILTER_CONFIG).map(filterType => 
          renderFilterChip(filterType as FilterType)
        )}
        {renderClearButton()}
      </ScrollView>
    </View>
  );
}

/**
 * Helper function to get active state for any filter type.
 * Add cases here when new filter types are added.
 */
const getFilterActiveState = (filters: MapFilters, filterType: FilterType): boolean => {
  switch (filterType) {
    case 'favourites':
      return filters.favourites;
    case 'openNow':
      return filters.openNow;
    // Future filter types:
    // case 'rating':
    //   return filters.minRating !== undefined;
    default:
      return false;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: TYPOGRAPHY.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  scrollContent: {
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    gap: TYPOGRAPHY.spacing.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.textPrimaryMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TYPOGRAPHY.spacing.xs,
    minHeight: 36, // Accessibility - minimum touch target
  },
  filterChipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  filterLabelActive: {
    color: COLORS.surface,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TYPOGRAPHY.spacing.xs,
    minHeight: 36,
  },
  clearLabel: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
  },
});