import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { opacity, radius, space } from '@/theme/tokens';
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
        { backgroundColor: selected ? color.accent.fill : color.bg.raised, opacity: pressed ? opacity.pressed : 1 },
      ]}>
      <Text variant="subheadEmphasized" tone={selected ? 'onAccent' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space[16],
    paddingVertical: space[8],
    borderRadius: radius.full,
  },
});
