import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { REVIEW_HISTORY } from '../constants/reviewHistory';
import { TYPOGRAPHY } from '../constants/typography';

export type ReviewHistoryEntry = {
  id: string;
  cafeName: string;
  rating: number;
  coffeeType?: string;
  reviewDate: string;
  notes?: string;
};

type ReviewHistorySectionProps = {
  entries: ReviewHistoryEntry[];
};

export function ReviewHistorySection({ entries }: ReviewHistorySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Review History</Text>

      {entries.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet.</Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cafeName}>{entry.cafeName}</Text>
              <Text style={styles.reviewDate}>{entry.reviewDate}</Text>
            </View>

            <View style={styles.ratingRow}>
              {Array.from({ length: REVIEW_HISTORY.maxRating }, (_, index) => (
                <Ionicons
                  key={`${entry.id}-${index}`}
                  name={index < entry.rating ? 'star' : 'star-outline'}
                  size={REVIEW_HISTORY.ratingIconSize}
                  color={COLORS.textPrimary}
                />
              ))}
            </View>

            {entry.notes && <Text style={styles.notes}>{entry.notes}</Text>}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginTop: TYPOGRAPHY.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  card: {
    backgroundColor: REVIEW_HISTORY.cardBackground,
    borderRadius: REVIEW_HISTORY.cardBorderRadius,
    padding: TYPOGRAPHY.spacing.md,
    marginBottom: TYPOGRAPHY.spacing.sm,
    borderWidth: REVIEW_HISTORY.cardBorderWidth,
    borderColor: COLORS.textPrimaryMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TYPOGRAPHY.spacing.xs,
    gap: TYPOGRAPHY.spacing.sm,
  },
  cafeName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: REVIEW_HISTORY.ratingRowGap,
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  notes: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
});
