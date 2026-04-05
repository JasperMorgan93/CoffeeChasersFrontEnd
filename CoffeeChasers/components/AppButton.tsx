import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { UI } from '../constants/ui';

type AppButtonVariant = 'primary' | 'light' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: AppButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  style,
  textStyle,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'light' && styles.buttonLight,
        variant === 'ghost' && styles.buttonGhost,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isPrimary ? COLORS.background : COLORS.textPrimary} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'light' && styles.labelLight,
            variant === 'ghost' && styles.labelGhost,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    borderRadius: TYPOGRAPHY.border_radius.round_corner,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI.button.minHeightMd,
  },
  buttonLight: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: UI.button.pressedOpacity,
  },
  buttonDisabled: {
    opacity: UI.button.disabledOpacity,
  },
  label: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  labelLight: {
    color: COLORS.textPrimary,
  },
  labelGhost: {
    color: COLORS.textPrimary,
  },
});
