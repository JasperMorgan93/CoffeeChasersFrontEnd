import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';

export const REVIEW_HISTORY = {
  maxRating: 5,
  ratingIconSize: 16,
  ratingRowGap: 4,
  cardBackground: COLORS.surface,
  cardBorderRadius: TYPOGRAPHY.border_radius.card,
  cardBorderWidth: 1,
} as const;
