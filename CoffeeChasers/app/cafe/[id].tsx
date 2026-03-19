import { ReactNode, useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useCafeDetails } from '../../hooks/useCafeDetails';

type SectionKey = 'rating' | 'address' | 'website' | 'hours';

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const DEFAULT_HEADER = 'Cafe Details';
const DEFAULT_ADDRESS = 'Address unavailable';
const DEFAULT_RATING = 'Rating unavailable';

const readParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const normalizeWebsite = (value?: string) => {
  if (!value) {
    return null;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
};

const parseOpeningHours = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildDescription = (cafeId: string) =>
  `This cafe page is the starting point for map selection. Google API-powered details will be loaded here soon. Cafe ID: ${cafeId}`;

const formatRating = (rating?: number | string | null) => {
  if (typeof rating === 'number') {
    return rating.toFixed(1);
  }

  if (typeof rating === 'string' && rating.trim()) {
    return rating;
  }

  return DEFAULT_RATING;
};

function CollapsibleSection({ title, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <View style={styles.infoSection}>
      <Pressable onPress={onToggle} style={styles.sectionHeader}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.toggleText}>{isExpanded ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {isExpanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function CafeDetailsScreen() {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    rating: false,
    address: false,
    website: false,
    hours: false,
  });

  const params = useLocalSearchParams();
  const cafeId = readParam(params.id) ?? 'unknown';
  const routeName = readParam(params.name);
  const routeRating = readParam(params.rating);
  const routeAddress = readParam(params.address);
  const routeWebsite = readParam(params.website);
  const routeOpeningHours = parseOpeningHours(params.openingHours);

  const hasRouteDetails = Boolean(
    routeRating || routeAddress || routeWebsite || routeOpeningHours.length
  );
  const shouldFetchDetails = cafeId !== 'unknown' && !hasRouteDetails;

  const {
    cafeDetails,
    isLoading: isLoadingDetails,
    isRefetching: isRefetchingDetails,
    error: detailsError,
  } = useCafeDetails(cafeId, shouldFetchDetails);

  const headerTitle = routeName ?? cafeDetails?.name ?? DEFAULT_HEADER;
  const rating = formatRating(cafeDetails?.googleRating ?? routeRating);
  const address = cafeDetails?.address ?? routeAddress ?? DEFAULT_ADDRESS;
  const website = normalizeWebsite(cafeDetails?.website ?? routeWebsite);
  const openingHours = cafeDetails?.openingHours.length
    ? cafeDetails.openingHours
    : routeOpeningHours;
  const description = buildDescription(cafeId);

  const handleOpenWebsite = useCallback(async () => {
    if (!website) {
      return;
    }

    const canOpen = await Linking.canOpenURL(website);
    if (canOpen) {
      await Linking.openURL(website);
    }
  }, [website]);

  const toggleSection = useCallback((section: SectionKey) => {
    setExpandedSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }));
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: headerTitle }} />
      <Text style={styles.header}>{headerTitle}</Text>
      <Text style={styles.description}>{description}</Text>
      {shouldFetchDetails && (isLoadingDetails || isRefetchingDetails) && (
        <Text style={styles.metaText}>Loading cafe details...</Text>
      )}
      {detailsError && <Text style={styles.errorText}>{detailsError}</Text>}

      <CollapsibleSection
        title="Google rating"
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <Text style={styles.value}>{rating}</Text>
      </CollapsibleSection>

      <CollapsibleSection
        title="Address"
        isExpanded={expandedSections.address}
        onToggle={() => toggleSection('address')}
      >
        <Text style={styles.value}>{address}</Text>
      </CollapsibleSection>

      {website && (
        <CollapsibleSection
          title="Website"
          isExpanded={expandedSections.website}
          onToggle={() => toggleSection('website')}
        >
          <Pressable onPress={handleOpenWebsite}>
            <Text style={styles.link}>{website}</Text>
          </Pressable>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Opening hours"
        isExpanded={expandedSections.hours}
        onToggle={() => toggleSection('hours')}
      >
        {openingHours.length > 0 ? (
          openingHours.map((hoursLine) => (
            <Text key={hoursLine} style={styles.value}>
              {hoursLine}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>Opening hours unavailable</Text>
        )}
      </CollapsibleSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    paddingVertical: TYPOGRAPHY.spacing.xl,
  },
  header: {
    fontSize: TYPOGRAPHY.fontSize.title,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    marginBottom: TYPOGRAPHY.spacing.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  metaText: {
    marginTop: TYPOGRAPHY.spacing.sm,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  errorText: {
    marginTop: TYPOGRAPHY.spacing.sm,
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  infoSection: {
    marginTop: TYPOGRAPHY.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionBody: {
    marginTop: TYPOGRAPHY.spacing.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimaryMuted,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  link: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textDecorationLine: 'underline',
    lineHeight: 24,
  },
});
