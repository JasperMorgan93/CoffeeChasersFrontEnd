import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppButton } from '../../components/AppButton';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { login, devBypass } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      // Navigation is handled automatically by the auth guard in _layout.tsx
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Coffee Chasers</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textPrimaryMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textPrimaryMuted}
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <AppButton
            label="Sign in"
            isLoading={isSubmitting}
            variant="primary"
            onPress={handleLogin}
            disabled={isSubmitting}
            style={styles.button}
          />

          <AppButton
            label="Create one"
            variant="ghost"
            onPress={() => router.push('/(auth)/register')}
            disabled={isSubmitting}
            style={styles.linkButton}
            textStyle={styles.linkText}
          />
        </View>

        {__DEV__ && devBypass && (
          <AppButton
            label="Dev bypass (not in production)"
            variant="ghost"
            onPress={devBypass}
            style={styles.devButton}
            textStyle={styles.devButtonText}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: TYPOGRAPHY.spacing.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.logo,
    fontFamily: TYPOGRAPHY.fontFamily.logo,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: TYPOGRAPHY.spacing.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
    textAlign: 'center',
    marginBottom: TYPOGRAPHY.spacing.xl * 2,
  },
  form: {
    gap: UI.auth.formGap,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: UI.auth.inputRadius,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    minHeight: UI.auth.inputMinHeight,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.danger,
    textAlign: 'center',
  },
  button: {
    minHeight: UI.button.minHeightLg,
    marginTop: TYPOGRAPHY.spacing.sm,
  },
  linkButton: {
    marginTop: TYPOGRAPHY.spacing.xs,
    alignSelf: 'center',
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  devButton: {
    marginTop: TYPOGRAPHY.spacing.xl,
    alignSelf: 'center',
    borderTopWidth: UI.auth.devDividerWidth,
    borderTopColor: COLORS.textPrimaryMuted,
    borderRadius: 0,
  },
  devButtonText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
});
