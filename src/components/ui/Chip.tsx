import { Pressable, StyleSheet, Text } from 'react-native';

import { fontSize, opacity, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const Chip = ({ label, selected, onPress }: Props) => {
  const { color } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? color.accent : color.background, opacity: pressed ? opacity.pressed : 1 },
      ]}>
      <Text style={[styles.label, { color: selected ? color.background : color.textPrimary }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
