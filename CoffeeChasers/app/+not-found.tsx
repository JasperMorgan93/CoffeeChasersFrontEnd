import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { TYPOGRAPHY } from '../constants/typography';
import { COLORS } from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Oops!',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontFamily: TYPOGRAPHY.fontFamily.bold,
          },
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>This page is roasting</Text>
        <AppButton
          label="Go to home screen"
          variant="ghost"
          onPress={() => router.push('/')}
          style={styles.link}
          textStyle={styles.linkText}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: TYPOGRAPHY.spacing.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.notFoundTitle,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: TYPOGRAPHY.spacing.md,
    color: COLORS.textPrimary,
  },
  link: {
    marginTop: TYPOGRAPHY.spacing.xs,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
});
