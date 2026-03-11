import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPlaceholder } from '../../components/MapPlaceholder';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MapPlaceholder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  overlay: {
    position: 'absolute',
    bottom: TYPOGRAPHY.spacing.lg,
    left: TYPOGRAPHY.spacing.lg,
    right: TYPOGRAPHY.spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(175, 136, 116, 0.9)',
    borderRadius: 16,
    padding: TYPOGRAPHY.spacing.md,
    gap: TYPOGRAPHY.spacing.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.title,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
  button: {
    width: '100%',
  },
});
