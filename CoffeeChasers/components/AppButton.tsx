import {
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

type AppButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({ label, onPress, disabled = false, style, textStyle }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: TYPOGRAPHY.spacing.sm,
    paddingHorizontal: TYPOGRAPHY.spacing.lg,
    borderRadius: UI.button.radius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: UI.button.minHeightMd,
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
});
