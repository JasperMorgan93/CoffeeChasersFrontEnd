import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ProfileSummaryTileProps = {
  title: string;
  value: string;
  supportingText: string;
  iconName: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
};

export function ProfileSummaryTile({
  title,
  value,
  supportingText,
  iconName,
  children,
}: ProfileSummaryTileProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileHeader}>
        <Text style={styles.tileTitle}>{title}</Text>
        <View style={styles.tileAccent}>
          <Ionicons name={iconName} size={18} color={COLORS.textPrimary} />
        </View>
      </View>

      <View style={styles.tileBody}>{children}</View>

      <Text style={styles.tileValue} numberOfLines={2}>
        {value}
      </Text>
      <Text style={styles.tileSupportingText}>{supportingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    minHeight: 188,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: TYPOGRAPHY.border_radius.card,
    padding: TYPOGRAPHY.spacing.md,
    shadowColor: COLORS.shadowBase,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: TYPOGRAPHY.spacing.sm,
  },
  tileTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  tileAccent: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 236, 0.7)',
  },
  tileBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.md,
  },
  tileValue: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  tileSupportingText: {
    marginTop: TYPOGRAPHY.spacing.xs,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
    lineHeight: 18,
  },
});