import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { TYPOGRAPHY } from '../constants/typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This page is roasting</Text>
        <Link href="/" style={styles.link}>
          <Text>Go to home screen</Text>
        </Link>
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
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.notFoundTitle,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: TYPOGRAPHY.spacing.md,
  },
  link: {
    marginTop: TYPOGRAPHY.spacing.xs,
  },
});
