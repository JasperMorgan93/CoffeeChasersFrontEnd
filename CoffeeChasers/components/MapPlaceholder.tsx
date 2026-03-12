import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

/**
 * Temporary map placeholder — swap this component for a Mapbox MapView
 * when the integration is ready. Keep the same prop signature so the
 * parent (index.tsx) needs no changes.
 */
export function MapPlaceholder() {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={64} color={COLORS.textPrimaryMuted} />
      <Text style={styles.label}>Map coming soon</Text>
      <Text style={styles.sublabel}>Mapbox integration pending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: TYPOGRAPHY.spacing.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  sublabel: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
});
