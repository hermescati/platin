import { Pressable, StyleSheet, Text } from 'react-native';

import { fontSize, opacity, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

export const PrimaryButton = ({ label, disabled = false, onPress }: Props) => {
  const { color } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color.accent, opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1 },
      ]}>
      <Text style={[styles.label, { color: color.background }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
