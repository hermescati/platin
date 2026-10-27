import { GlassView } from 'expo-lucent';
import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, type IconName } from '@/icons/Icon';
import { Text } from '@/ui/Text';
import { usePressScale } from '@/hooks/usePressScale';
import { layout, opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  icon?: IconName;
  iconOnly?: boolean;
  size?: keyof typeof layout.glassButton;
  pressed?: boolean;
  disabled?: boolean;
  iconVariant?: 'outline' | 'fill';
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof View>>;
}

export const GlassButton = ({ label, icon, iconOnly = false, size = 'medium', pressed = false, disabled = false, iconVariant, onPress, ref }: Props) => {
  const { color } = useTheme();
  const press = usePressScale();
  const height = layout.glassButton[size];

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={space[4]}>
      <Animated.View style={[press.style, disabled && styles.disabled]}>
        <GlassView
          isInteractive
          tintColor={pressed ? color.glass.fillPressed : undefined}
          style={[
            styles.glass,
            { height, minWidth: height },
            iconOnly ? { width: height } : styles.withLabel,
          ]}>
          {icon && <Icon name={icon} size={size === 'large' ? 24 : 20} variant={iconVariant} weight="bold" />}
          {!iconOnly && <Text variant="subheadEmphasized">{label}</Text>}
        </GlassView>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  glass: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[8],
  },
  disabled: {
    opacity: opacity.disabled,
  },
  withLabel: {
    paddingHorizontal: space[16],
  },
});
