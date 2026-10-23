import { useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Icon } from '@/components/icon/Icon';
import { useSearchQuery } from '@/components/search/SearchQuery';
import type { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { searchPlaceholder, type TabConfig } from '@/components/tab-bar/tabs';
import { layout, motion, space, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const fullHeight = layout.tabBarHeight;
const modeHeight = layout.searchModeHeight;
const modeInset = (fullHeight - modeHeight) / 2;

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
  const backFillStyle = useAnimatedStyle(() => ({ opacity: backPress.press.get() }));
  const backInkStyle = useAnimatedStyle(() => ({ opacity: 1 - backPress.press.get() * motion.pressIconDim }));
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
          <Animated.View style={[styles.fill, { backgroundColor: color.chrome.pressFill }, backFillStyle]} />
          <Animated.View style={[styles.center, backInkStyle]}>
            <Icon name={backTab.icon} size={layout.tabIconSize} />
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.field, contentStyle]}>
        <Icon name="search" size={layout.searchFieldIconSize} />
        <TextInput
          ref={input}
          style={[styles.input, { color: color.text.primary }]}
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={color.text.placeholder}
          selectionColor={color.accent.default}
          cursorColor={color.accent.default}
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
    left: modeInset,
    top: modeInset,
    width: modeHeight,
    height: modeHeight,
  },
  field: {
    position: 'absolute',
    left: modeInset + modeHeight + layout.searchModeGap,
    right: modeInset + modeHeight + layout.searchModeGap,
    top: modeInset,
    height: modeHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingHorizontal: layout.searchFieldInset,
  },
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: modeHeight / 2,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    paddingVertical: 0,
  },
});
