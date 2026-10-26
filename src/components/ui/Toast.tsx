import { useEffect, useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Icon } from '@/components/icon/Icon';
import { Text } from '@/components/ui/Text';
import { layout, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface ToastData {
  id: number;
  title: string;
  sub?: string;
  action?: { label: string; onPress: () => void };
}

interface Props {
  toast: ToastData | null;
  bottom: number;
  onHide: () => void;
}

export const Toast = ({ toast, bottom, onHide }: Props) => {
  const { color } = useTheme();
  const gradientId = `toast-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const shown = useSharedValue(0);
  const height = toast?.sub ? layout.toastWithSubHeight : layout.toastHeight;

  useEffect(() => {
    if (!toast) {
      return;
    }
    shown.set(withSpring(1, motion.springs.settle));
    const hold = toast.action ? motion.toast.holdWithAction : motion.toast.hold;
    const timer = setTimeout(() => {
      shown.set(
        withSpring(0, motion.springs.pop, (finished) => {
          if (finished) {
            scheduleOnRN(onHide);
          }
        }),
      );
    }, hold);
    return () => clearTimeout(timer);
  }, [toast, shown, onHide]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * space[24] }, { scale: 0.96 + shown.value * 0.04 }],
  }));

  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom }, style]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert">
      <View
        style={[
          styles.toast,
          { height, borderColor: color.toast.rim, shadowColor: color.shadow.floating },
        ]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color.toast.top} />
              <Stop offset="1" stopColor={color.toast.bottom} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={height / 2} fill={`url(#${gradientId})`} />
        </Svg>
        <View style={styles.glyph}>
          <Icon name="check" size={20} weight="bold" color={color.status.success} />
        </View>
        <View style={styles.text}>
          <Text variant="subheadEmphasized" numberOfLines={1}>{toast.title}</Text>
          {toast.sub && <Text variant="footnote" tone="secondary" numberOfLines={1}>{toast.sub}</Text>}
        </View>
        {toast.action ? (
          <>
            <View style={[styles.divider, { backgroundColor: color.line.hairline }]} />
            <Pressable onPress={toast.action.onPress} accessibilityRole="button" style={styles.action}>
              <Text variant="subheadEmphasized" tone="accent">{toast.action.label}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.tail} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space[16],
    right: space[16],
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: layout.toastMaxWidth,
    borderRadius: radius.full,
    borderWidth: layout.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    paddingLeft: space[16],
    paddingRight: space[8],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: space[16] },
    shadowRadius: space[32],
    shadowOpacity: 1,
    elevation: space[8],
  },
  glyph: {
    width: space[24],
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: space[2],
  },
  divider: {
    width: layout.hairline,
    height: space[24],
  },
  action: {
    height: layout.glassButton.medium,
    justifyContent: 'center',
    paddingLeft: space[4],
    paddingRight: space[16],
  },
  tail: {
    width: space[8],
  },
});
