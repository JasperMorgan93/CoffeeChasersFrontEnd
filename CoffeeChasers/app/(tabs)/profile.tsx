import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { ReviewHistorySection } from '../../components/ReviewHistorySection';
import { useReviewHistory } from '../../hooks/useReviewHistory';

export default function Profile() {
  const { reviewHistory, isLoading, error, refetch, isRefetching } = useReviewHistory();

  const renderReviewSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
          <Text style={styles.loadingText}>Loading your reviews...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch} disabled={isRefetching}>
            {isRefetching ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.retryText}>Tap to retry</Text>
            )}
          </Pressable>
        </View>
      );
    }

    if (reviewHistory.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            Start exploring cafes to build your review history!
          </Text>
        </View>
      );
    }

    return <ReviewHistorySection entries={reviewHistory} />;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your account details will appear here.</Text>
      </View>

      {renderReviewSection()}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    marginTop: TYPOGRAPHY.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: TYPOGRAPHY.spacing.md,
  },
  retryButton: {
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textPrimaryMuted,
    minHeight: 44, // Accessibility - minimum touch target
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.subtitle,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
