import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    bold: 'Inter_700Bold',
    logo: 'Lobster_400Regular',
  },
  fontSize: {
    logo: 52,
    title: 24,
    subtitle: 20,
    body: 16,
    text: 14,
    notFoundTitle: 20,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  border_radius: {
    round_corner: 24,
    card: 12,
    button: 8,
    input: 8,
  },
} as const;

export const CORE_FONT_ASSETS = {
  [TYPOGRAPHY.fontFamily.regular]: Inter_400Regular,
  [TYPOGRAPHY.fontFamily.medium]: Inter_500Medium,
  [TYPOGRAPHY.fontFamily.bold]: Inter_700Bold,
  [TYPOGRAPHY.fontFamily.logo]: Lobster_400Regular,
} as const;
