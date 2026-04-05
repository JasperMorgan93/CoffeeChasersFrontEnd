import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CoffeeBeanRatingSlider from '../../components/CoffeeBeanRatingSlider';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';

const STEP_COUNT = 10;

export default function Review() {
  const [currentStep, setCurrentStep] = useState(4);

  const clampedStep = useMemo(
    () => Math.max(0, Math.min(STEP_COUNT - 1, currentStep)),
    [currentStep],
  );

  const descriptor = clampedStep <= 3 ? 'Okay' : clampedStep <= 5 ? 'Good' : clampedStep <= 7 ? 'Great' : 'Perfect';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>How was the coffee?</Text>
        <Text style={styles.subtitle}>Slide your bean from Okay to Perfect.</Text>

        <CoffeeBeanRatingSlider
          value={clampedStep}
          onChange={setCurrentStep}
          steps={STEP_COUNT}
        />

        <View style={styles.labelRow}>
          <Text style={styles.currentLabel}>{descriptor}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: TYPOGRAPHY.spacing.lg,
  },
  card: {
    backgroundColor: COLORS.reviewCardBackground,
    borderRadius: UI.review.cardRadius,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    paddingVertical: TYPOGRAPHY.spacing.xl,
    borderWidth: UI.review.cardBorderWidth,
    borderColor: COLORS.reviewCardBorder,
    shadowColor: COLORS.reviewCardShadow,
    shadowOpacity: UI.review.cardShadowOpacity,
    shadowRadius: UI.review.cardShadowRadius,
    shadowOffset: UI.review.cardShadowOffset,
    elevation: UI.review.cardElevation,
  },
  title: {
    textAlign: 'center',
    fontSize: UI.review.titleFontSize,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
    marginBottom: TYPOGRAPHY.spacing.xl,
  },
  labelRow: {
    marginTop: TYPOGRAPHY.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  edgeLabel: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentLabel: {
    fontSize: TYPOGRAPHY.fontSize.subtitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.reviewCurrentLabel,
    textTransform: 'uppercase',
    letterSpacing: UI.review.labelLetterSpacing,
  },
});
