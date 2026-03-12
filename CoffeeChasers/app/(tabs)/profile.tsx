import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { ReviewHistorySection, type ReviewHistoryEntry } from '../../components/ReviewHistorySection';

const mockReviewHistory: ReviewHistoryEntry[] = [
  {
    id: 'review-1',
    cafeName: 'Bean & Bloom',
    reviewDate: 'Mar 10, 2026',
    rating: 5,
    notes: 'Great flat white and friendly staff.',
  },
  {
    id: 'review-2',
    cafeName: 'Roast House',
    reviewDate: 'Mar 3, 2026',
    rating: 4,
    notes: 'Nice espresso, a little busy during lunch.',
  },
  {
    id: 'review-3',
    cafeName: 'Morning Drip',
    reviewDate: 'Feb 25, 2026',
    rating: 4,
    notes: 'Good pour-over and cozy seating.',
  },
  {
    id: 'review-4',
    cafeName: 'Morning Drip',
    reviewDate: 'Feb 25, 2026',
    rating: 4,
    notes: 'Good pour-over and cozy seating.',
  },
  {
    id: 'review-5',
    cafeName: 'Morning Drip',
    reviewDate: 'Feb 25, 2026',
    rating: 4,
    notes: 'Good pour-over and cozy seating.',
  },
];

export default function Profile() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your account details will appear here.</Text>
      </View>

      <ReviewHistorySection entries={mockReviewHistory} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: TYPOGRAPHY.spacing.lg,
    paddingBottom: TYPOGRAPHY.spacing.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.title,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
});
