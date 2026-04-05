import { useRouter } from 'expo-router';
import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
        <Pressable
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
          onPress={() => router.push('/')}
        >
          <Text style={styles.linkText}>Go to home screen</Text>
        </Pressable>
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
  linkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
});
