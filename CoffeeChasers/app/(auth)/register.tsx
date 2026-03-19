import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name: trimmedName, email: trimmedEmail, password });
      // Auth guard in _layout.tsx handles redirect to (tabs) on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Coffee Chasers</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={COLORS.textPrimaryMuted}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
            returnKeyType="next"
          />
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
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textPrimaryMuted}
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={COLORS.textPrimaryMuted}
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isSubmitting}
            onSubmitEditing={handleRegister}
            returnKeyType="go"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: TYPOGRAPHY.spacing.xl,
    paddingVertical: TYPOGRAPHY.spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
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
    gap: TYPOGRAPHY.spacing.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.md,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#c0392b',
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 10,
    paddingVertical: TYPOGRAPHY.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: TYPOGRAPHY.spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.surface,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: TYPOGRAPHY.spacing.sm,
  },
  linkButtonPressed: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimaryMuted,
  },
  linkTextBold: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
  },
});
