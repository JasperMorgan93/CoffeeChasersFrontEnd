import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { UI } from '../constants/ui';
import { ProfileSummaryTile } from './profile/ProfileSummaryTile';
import RatingBeanIcon from './RatingBeanIcon';
import { ReviewHistoryEntry } from './ReviewHistorySection';

type ProfileSummarySectionProps = {
  entries: ReviewHistoryEntry[];
};

type CafeSummary = {
  cafeName: string;
  reviewCount: number;
  totalRating: number;
  averageRating: number;
  maxRating: number;
  topReviewCount: number;
};

const formatAverage = (value: number | null) => {
  if (value === null) {
    return 'No data';
  }

  return value.toFixed(1);
};

const getCafeSummaries = (entries: ReviewHistoryEntry[]): CafeSummary[] => {
  const summaries = new Map<string, Omit<CafeSummary, 'averageRating'>>();

  for (const entry of entries) {
    const existing = summaries.get(entry.cafeName);

    if (existing) {
      existing.reviewCount += 1;
      existing.totalRating += entry.rating;
      if (entry.rating > existing.maxRating) {
        existing.maxRating = entry.rating;
        existing.topReviewCount = 1;
      } else if (entry.rating === existing.maxRating) {
        existing.topReviewCount += 1;
      }

      continue;
    }

    summaries.set(entry.cafeName, {
      cafeName: entry.cafeName,
      reviewCount: 1,
      totalRating: entry.rating,
      maxRating: entry.rating,
      topReviewCount: 1,
    });
  }

  return Array.from(summaries.values(), (summary) => ({
    ...summary,
    averageRating: summary.totalRating / summary.reviewCount,
  }));
};

const compareCafeNames = (left: string, right: string) => left.localeCompare(right);

const getFavouriteSpot = (summaries: CafeSummary[]) => {
  return summaries.reduce<CafeSummary | null>((currentBest, candidate) => {
    if (!currentBest) {
      return candidate;
    }

    if (candidate.reviewCount !== currentBest.reviewCount) {
      return candidate.reviewCount > currentBest.reviewCount ? candidate : currentBest;
    }

    if (candidate.averageRating !== currentBest.averageRating) {
      return candidate.averageRating > currentBest.averageRating ? candidate : currentBest;
    }

    return compareCafeNames(candidate.cafeName, currentBest.cafeName) < 0 ? candidate : currentBest;
  }, null);
};

const getBestBrew = (summaries: CafeSummary[]) => {
  return summaries.reduce<CafeSummary | null>((currentBest, candidate) => {
    if (!currentBest) {
      return candidate;
    }

    if (candidate.maxRating !== currentBest.maxRating) {
      return candidate.maxRating > currentBest.maxRating ? candidate : currentBest;
    }

    if (candidate.topReviewCount !== currentBest.topReviewCount) {
      return candidate.topReviewCount > currentBest.topReviewCount ? candidate : currentBest;
    }

    if (candidate.averageRating !== currentBest.averageRating) {
      return candidate.averageRating > currentBest.averageRating ? candidate : currentBest;
    }

    return compareCafeNames(candidate.cafeName, currentBest.cafeName) < 0 ? candidate : currentBest;
  }, null);
};

function ReviewCountGraphic({ reviewCount }: { reviewCount: number }) {
  const barHeights = [14, 22, 30, 38];
  const activeBars = Math.min(barHeights.length, Math.max(0, reviewCount));

  return (
    <View style={styles.reviewCountGraphic}>
      <View style={styles.reviewCountBadge}>
        <Text style={styles.reviewCountValue}>{reviewCount}</Text>
      </View>
      <View style={styles.reviewCountBars}>
        {barHeights.map((height, index) => {
          const isActive = index < activeBars;

          return (
            <View
              key={`review-bar-${height}`}
              style={[
                styles.reviewCountBar,
                {
                  height,
                  opacity: isActive ? 1 : 0.28,
                  backgroundColor: isActive ? COLORS.textPrimary : COLORS.borderSubtle,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

export function ProfileSummarySection({ entries }: ProfileSummarySectionProps) {
  const reviewCount = entries.length;
  const averageRating = reviewCount > 0 ? entries.reduce((sum, entry) => sum + entry.rating, 0) / reviewCount : null;
  const cafeSummaries = getCafeSummaries(entries);
  const favouriteSpot = getFavouriteSpot(cafeSummaries);
  const bestBrew = getBestBrew(cafeSummaries);
  const tiles = [
    {
      key: 'average-brew-rating',
      title: 'Average brew rating',
      value: formatAverage(averageRating),
      supportingText:
        reviewCount > 0
          ? `Across ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
          : 'Start reviewing to unlock this stat',
      iconName: 'sparkles-outline' as const,
      body: (
        <View style={styles.averageTileContent}>
          <View style={[styles.averageBeanWrap, averageRating === null && styles.averageBeanWrapMuted]}>
            <RatingBeanIcon rating={averageRating ?? 1} size={UI.slider.knobSize * 0.72} />
          </View>
          <Text style={styles.averageValue}>{averageRating === null ? '--' : averageRating.toFixed(1)}</Text>
        </View>
      ),
    },
    {
      key: 'review-count',
      title: 'Number of reviews',
      value: `${reviewCount}`,
      supportingText: reviewCount === 1 ? 'Review logged so far' : 'Reviews logged so far',
      iconName: 'stats-chart-outline' as const,
      body: <ReviewCountGraphic reviewCount={reviewCount} />,
    },
    {
      key: 'favourite-spot',
      title: 'Favourite Spot',
      value: favouriteSpot?.cafeName ?? 'No favourite yet',
      supportingText: favouriteSpot
        ? `${favouriteSpot.reviewCount} visit${favouriteSpot.reviewCount === 1 ? '' : 's'} logged`
        : 'Review a cafe more than once to surface it here',
      iconName: 'cafe-outline' as const,
      body: (
        <View style={styles.textTileBody}>
          <Text style={styles.textTileEyebrow}>Most visited cafe</Text>
        </View>
      ),
    },
    {
      key: 'best-brew',
      title: 'Best Brew',
      value: bestBrew?.cafeName ?? 'No standout yet',
      supportingText: bestBrew
        ? `${bestBrew.topReviewCount} top review${bestBrew.topReviewCount === 1 ? '' : 's'} at ${bestBrew.maxRating.toFixed(1)}`
        : 'Your highest-rated cafe will appear here',
      iconName: 'trophy-outline' as const,
      body: (
        <View style={styles.bestBrewBody}>
          <RatingBeanIcon rating={bestBrew?.maxRating ?? 1} size={UI.slider.knobSize * 0.5} />
          <Text style={styles.bestBrewScore}>{bestBrew ? bestBrew.maxRating.toFixed(1) : '--'}</Text>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Coffee Stats</Text>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <ProfileSummaryTile
            key={tile.key}
            title={tile.title}
            value={tile.value}
            supportingText={tile.supportingText}
            iconName={tile.iconName}
          >
            {tile.body}
          </ProfileSummaryTile>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginBottom: TYPOGRAPHY.spacing.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TYPOGRAPHY.spacing.sm,
  },
  averageTileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TYPOGRAPHY.spacing.sm,
  },
  averageBeanWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageBeanWrapMuted: {
    opacity: 0.42,
  },
  averageValue: {
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  reviewCountGraphic: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: TYPOGRAPHY.spacing.sm,
  },
  reviewCountBadge: {
    minWidth: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 236, 0.86)',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  reviewCountValue: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  reviewCountBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    paddingBottom: 2,
  },
  reviewCountBar: {
    flex: 1,
    borderRadius: 999,
    minWidth: 10,
  },
  textTileBody: {
    justifyContent: 'center',
  },
  textTileEyebrow: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
  },
  bestBrewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TYPOGRAPHY.spacing.sm,
  },
  bestBrewScore: {
    fontSize: 26,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
});