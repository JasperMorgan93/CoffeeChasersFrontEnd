import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CoffeeBeanRatingSlider from '../../components/CoffeeBeanRatingSlider';
import { AppButton } from '../../components/AppButton';
import { COFFEE_TYPES, type CoffeeType } from '../../constants/coffeeTypes';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useCafes } from '../../hooks/useCafes';
import { apiService } from '../../services/api';
import { Cafe } from '../../types/cafe';
import { getDefaultFilters } from '../../types/mapFilters';

const STEP_COUNT = 10;
const DEFAULT_FILTERS = getDefaultFilters();
type ReviewStep = 'coffeeType' | 'rating';

const mapStepToApiRating = (step: number, totalSteps: number) => {
  const normalized = totalSteps > 1 ? step / (totalSteps - 1) : 0;
  // Backend rating appears to be 1-5; map slider step range onto that scale.
  return Math.max(1, Math.min(5, Math.round(normalized * 4) + 1));
};

export default function Review() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [selectedCoffeeType, setSelectedCoffeeType] = useState<CoffeeType | null>(null);
  const [reviewStep, setReviewStep] = useState<ReviewStep>('coffeeType');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const { cafes, isLoading, error } = useCafes(DEFAULT_FILTERS);

  const clampedStep = useMemo(
    () => Math.max(0, Math.min(STEP_COUNT - 1, currentStep)),
    [currentStep],
  );

  const filteredCafes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return cafes.filter((cafe) => cafe.name.toLowerCase().includes(normalizedQuery));
  }, [cafes, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleSubmitReview = async () => {
    if (!selectedCafe) {
      setSubmitError('Please select a cafe.');
      return;
    }

    if (!selectedCoffeeType) {
      setSubmitError('Please select a coffee type.');
      return;
    }

    if (!user) {
      setSubmitError('You must be logged in to submit a review.');
      return;
    }

    const parsedCafeId = Number(selectedCafe.id);
    const cafeIdPayload = Number.isNaN(parsedCafeId) ? selectedCafe.id : parsedCafeId;

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmittingReview(true);

    try {
      await apiService.createReview({
        cafe_id: cafeIdPayload,
        rating: mapStepToApiRating(clampedStep, STEP_COUNT),
        coffee_type: selectedCoffeeType,
      });

      setSubmitSuccess('Review submitted. Thank you!');
      setSelectedCafe(null);
      setSelectedCoffeeType(null);
      setReviewStep('coffeeType');
      setCurrentStep(4);
      setSearchQuery('');
    } catch (submissionError) {
      setSubmitError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const descriptor = clampedStep <= 3 ? 'Okay' : clampedStep <= 5 ? 'Good' : clampedStep <= 7 ? 'Great' : clampedStep <= 8 ? 'Excellent' : 'Too Good';

  if (!selectedCafe) {
    return (
      <View style={styles.container}>
        <View style={styles.searchCard}>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.subtitle}>Search by cafe name, then select where you are drinking.</Text>

          {submitSuccess && <Text style={styles.successText}>{submitSuccess}</Text>}

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search cafe by name"
            placeholderTextColor={COLORS.textPrimaryMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!hasSearchQuery ? (
            <View style={styles.listStateContainer}>
              <Text style={styles.listStateText}>Start typing to search cafes.</Text>
            </View>
          ) : isLoading ? (
            <View style={styles.listStateContainer}>
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
              <Text style={styles.listStateText}>Loading cafes...</Text>
            </View>
          ) : error ? (
            <View style={styles.listStateContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCafes}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.listStateContainer}>
                  <Text style={styles.listStateText}>No cafes match your search.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCafe(item);
                    setReviewStep('coffeeType');
                  }}
                  style={({ pressed }) => [styles.cafeRow, pressed && styles.cafeRowPressed]}
                >
                  <Text style={styles.cafeName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cafeAddress} numberOfLines={1}>
                    {item.address || 'Address unavailable'}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    );
  }

  const handleBackPress = () => {
    if (reviewStep === 'rating') {
      setReviewStep('coffeeType');
      return;
    }

    setSelectedCafe(null);
    setSelectedCoffeeType(null);
    setSubmitError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTopRowSpacer} />
          <AppButton
            label="Back"
            variant="light"
            onPress={handleBackPress}
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />
        </View>

        {reviewStep === 'coffeeType' ? (
          <>
            <Text style={styles.title}>What was in the cup?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coffeeTypeList}
            >
              {COFFEE_TYPES.map((coffeeType) => {
                const isSelected = selectedCoffeeType === coffeeType;

                return (
                  <Pressable
                    key={coffeeType}
                    onPress={() => setSelectedCoffeeType(coffeeType)}
                    style={({ pressed }) => [
                      styles.coffeeTypeChip,
                      isSelected && styles.coffeeTypeChipSelected,
                      pressed && styles.coffeeTypeChipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.coffeeTypeChipLabel, isSelected && styles.coffeeTypeChipLabelSelected]}
                    >
                      {coffeeType}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <AppButton
              label="Next"
              onPress={() => setReviewStep('rating')}
              variant="primary"
              disabled={!selectedCoffeeType}
              style={styles.submitReviewButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>How good was the brew?</Text>

            {selectedCoffeeType && (
              <Text style={styles.selectedCoffeeTypeLabel}>Coffee type: {selectedCoffeeType}</Text>
            )}

            <CoffeeBeanRatingSlider
              value={clampedStep}
              onChange={setCurrentStep}
              steps={STEP_COUNT}
            />

            <View style={styles.labelRow}>
              <Text style={styles.currentLabel}>{descriptor}</Text>
            </View>

            {submitError && <Text style={styles.errorText}>{submitError}</Text>}

            <AppButton
              label="Review"
              onPress={handleSubmitReview}
              variant="primary"
              isLoading={isSubmittingReview}
              disabled={isSubmittingReview || !selectedCoffeeType}
              style={styles.submitReviewButton}
            />
          </>
        )}
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
  searchCard: {
    flex: 1,
    backgroundColor: COLORS.reviewCardBackground,
    borderRadius: UI.review.cardRadius,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    paddingTop: TYPOGRAPHY.spacing.xl,
    paddingBottom: TYPOGRAPHY.spacing.md,
    borderWidth: UI.review.cardBorderWidth,
    borderColor: COLORS.reviewCardBorder,
    shadowColor: COLORS.reviewCardShadow,
    shadowOpacity: UI.review.cardShadowOpacity,
    shadowRadius: UI.review.cardShadowRadius,
    shadowOffset: UI.review.cardShadowOffset,
    elevation: UI.review.cardElevation,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  cardTopRowSpacer: {
    width: 72,
  },
  backButton: {
    minHeight: UI.button.minHeightSm,
    minWidth: 72,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
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
  coffeeTypeList: {
    gap: TYPOGRAPHY.spacing.xs,
    paddingBottom: TYPOGRAPHY.spacing.md,
  },
  coffeeTypeChip: {
    minHeight: UI.filter.chipMinHeight,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    paddingHorizontal: TYPOGRAPHY.spacing.sm,
    paddingVertical: TYPOGRAPHY.spacing.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coffeeTypeChipSelected: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  coffeeTypeChipPressed: {
    opacity: UI.feedback.pressedSoftOpacity,
  },
  coffeeTypeChipLabel: {
    fontSize: UI.filter.labelFontSize,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  coffeeTypeChipLabelSelected: {
    color: COLORS.surface,
  },
  selectedCoffeeTypeLabel: {
    marginTop: TYPOGRAPHY.spacing.xs,
    marginBottom: TYPOGRAPHY.spacing.md,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: UI.auth.inputRadius,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    minHeight: UI.auth.inputMinHeight,
    marginBottom: TYPOGRAPHY.spacing.md,
  },
  listContent: {
    paddingBottom: TYPOGRAPHY.spacing.md,
  },
  cafeRow: {
    borderRadius: UI.auth.inputRadius,
    backgroundColor: COLORS.surface,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  cafeRowPressed: {
    opacity: UI.feedback.pressedSoftOpacity,
  },
  cafeName: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cafeAddress: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  listStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TYPOGRAPHY.spacing.lg,
    gap: TYPOGRAPHY.spacing.xs,
  },
  listStateText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.danger,
    textAlign: 'center',
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  labelRow: {
    marginTop: TYPOGRAPHY.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: TYPOGRAPHY.fontSize.subtitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.reviewCurrentLabel,
    textTransform: 'uppercase',
    letterSpacing: UI.review.labelLetterSpacing,
  },
  submitReviewButton: {
    marginTop: TYPOGRAPHY.spacing.md,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
  },
});
