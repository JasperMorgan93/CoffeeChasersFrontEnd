import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';
import { AppButton } from '../../components/AppButton';
import { ProfileSummarySection } from '../../components/ProfileSummarySection';
import { ReviewHistorySection } from '../../components/ReviewHistorySection';
import { useReviewHistory } from '../../hooks/useReviewHistory';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { reviewHistory, isLoading, error, refetch, isRefetching } = useReviewHistory();
  const { user, logout } = useAuth();

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
          <AppButton
            label="Tap to retry"
            onPress={refetch}
            disabled={isRefetching}
            isLoading={isRefetching}
            variant="light"
            style={styles.retryButton}
            textStyle={styles.retryText}
          />
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{user?.name ?? 'My Profile'}</Text>
        </View>
        <AppButton
          label="Sign out"
          onPress={logout}
          variant="light"
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />
      </View>

      <ProfileSummarySection entries={reviewHistory} />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: TYPOGRAPHY.spacing.lg,
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
    minHeight: UI.button.minHeightMd,
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
  logoutButton: {
    minHeight: UI.button.minHeightSm,
    alignSelf: 'flex-start',
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
});
