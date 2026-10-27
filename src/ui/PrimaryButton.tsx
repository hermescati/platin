import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/ui/Text';
import { opacity, radius, space } from '@/theme/tokens';
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
        { backgroundColor: color.accent.fill, opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1 },
      ]}>
      <Text variant="headline" tone="onAccent">{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: space[16],
    borderRadius: radius.full,
  },
});
