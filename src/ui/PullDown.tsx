import { GlassView } from 'expo-lucent';
import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/usePressScale';
import { Icon } from '@/icons/Icon';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/ui/Text';

interface Props {
  label: string;
  selected?: boolean;
  open?: boolean;
  onPress: () => void;
  ref?: Ref<ComponentRef<typeof View>>;
}

export const PullDown = ({ label, selected = false, open = false, onPress, ref }: Props) => {
  const { color } = useTheme();
  const press = usePressScale();
  const ink = selected ? color.accent.default : color.text.primary;
  const tint = selected
    ? open
      ? color.glass.tintFillPressed
      : color.glass.tintFill
    : open
      ? color.glass.fillPressed
      : undefined;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: open, selected }}>
      <Animated.View style={press.style}>
        <GlassView isInteractive tintColor={tint} style={styles.pill}>
          <Text variant="subheadEmphasized" style={{ color: ink }}>{label}</Text>
          <Icon name="chevronDown" size={14} weight="bold" color={ink} />
        </GlassView>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: layout.pullDown,
    paddingHorizontal: space[16],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[6],
  },
});
