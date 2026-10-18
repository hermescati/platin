import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useSearchQuery } from '@/components/search/SearchQuery';
import type { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { searchPlaceholder, type TabConfig } from '@/components/tab-bar/tabs';
import { fontSize, layout, motion, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const fullHeight = layout.tabBarHeight;

const clamp01 = (value: number) => {
  'worklet';
  return Math.min(1, Math.max(0, value));
};

interface Props {
  active: boolean;
  mode: SharedValue<number>;
  backTab: TabConfig;
  backPress: ReturnType<typeof useGlassPress>;
  onBack: () => void;
}

export const SearchMode = ({ active, mode, backTab, backPress, onBack }: Props) => {
  const { color } = useTheme();
  const { query, setQuery } = useSearchQuery();
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (!active) {
      input.current?.blur();
      return;
    }
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const backStyle = useAnimatedStyle(() => ({
    opacity: clamp01(mode.get() * 2 - 0.6),
    transform: [{ scale: 1 + backPress.press.get() * motion.pressGrow }],
  }));
  const backGlowStyle = useAnimatedStyle(() => ({ opacity: backPress.press.get() }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: clamp01(mode.get() * 2 - 1) }));

  const goBack = () => {
    Keyboard.dismiss();
    onBack();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={active ? 'box-none' : 'none'}>
      <Pressable
        style={styles.back}
        onPress={goBack}
        onPressIn={backPress.onPressIn}
        onPressOut={backPress.onPressOut}
        accessibilityRole="button"
        accessibilityLabel={backTab.label}>
        <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
          <Animated.View style={[styles.glow, { boxShadow: color.lensGlow }, backGlowStyle]} />
          <View style={styles.center}>
            <MaterialIcons name={backTab.icon} size={layout.tabIconSize} color={color.textPrimary} />
          </View>
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.field, contentStyle]}>
        <MaterialIcons name="search" size={layout.searchFieldIconSize} color={color.textSecondary} />
        <TextInput
          ref={input}
          style={[styles.input, { color: color.textPrimary }]}
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={color.textSecondary}
          selectionColor={color.accent}
          cursorColor={color.accent}
          returnKeyType="search"
          autoCorrect={false}
          numberOfLines={1}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  back: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: fullHeight,
    height: fullHeight,
  },
  field: {
    position: 'absolute',
    left: fullHeight + layout.tabBarGap,
    right: fullHeight + layout.tabBarGap,
    top: 0,
    height: fullHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: fullHeight / 2,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    paddingVertical: 0,
  },
});
