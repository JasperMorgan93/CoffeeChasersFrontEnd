import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { FilterBarProps, FilterBarSettings } from '../types/filters';

const defaultSettings: FilterBarSettings = {
  showClearAll: true,
  horizontal: true,
  transparent: false,
  useSafeArea: false,
};

/**
 * Generic, reusable filter bar component that works with any filter configuration.
 * Can be used for map filters, search filters, profile filters, etc.
 */
export function FilterBar<T extends string, F extends Record<string, any>>({
  filters,
  filterConfig,
  onToggleFilter,
  onClearAll,
  hasActiveFilters,
  getFilterActiveState,
  settings = {},
}: FilterBarProps<T, F>) {
  const insets = useSafeAreaInsets();
  const config = { ...defaultSettings, ...settings };

  const renderFilterChip = (filterType: T) => {
    const filterOption = filterConfig[filterType];
    const isActive = getFilterActiveState(filters, filterType);

    return (
      <Pressable
        key={filterType}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => onToggleFilter(filterType)}
      >
        <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
          {filterOption.label}
        </Text>
        {isActive && <Ionicons name="checkmark-circle" size={16} color={COLORS.surface} />}
      </Pressable>
    );
  };

  const renderClearButton = () => {
    if (!config.showClearAll || !hasActiveFilters) return null;

    return (
      <Pressable style={styles.clearButton} onPress={onClearAll}>
        <Ionicons name="close-circle" size={16} color={COLORS.textPrimaryMuted} />
        <Text style={styles.clearLabel}>Clear</Text>
      </Pressable>
    );
  };

  const containerStyle = [
    styles.container,
    config.transparent && styles.transparentContainer,
    config.useSafeArea && { paddingTop: insets.top + TYPOGRAPHY.spacing.xs },
  ];

  const content = (
    <>
      {Object.keys(filterConfig).map((filterType) => renderFilterChip(filterType as T))}
      {renderClearButton()}
    </>
  );

  return (
    <View style={containerStyle}>
      {config.horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.verticalContent}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: TYPOGRAPHY.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  scrollContent: {
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    gap: TYPOGRAPHY.spacing.sm,
  },
  verticalContent: {
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TYPOGRAPHY.spacing.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.textPrimaryMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TYPOGRAPHY.spacing.xs,
    minHeight: 36,
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
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
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
