import { useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedNativeGlassBlur } from '@/components/glass/NativeGlass';

import { Icon } from '@/components/icon/Icon';
import { useSearchQuery } from '@/components/search/SearchQuery';
import type { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { searchPlaceholder, type TabConfig } from '@/components/tab-bar/tabs';
import { layout, motion, searchFieldText, space, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const fullHeight = layout.tabBarHeight;
const modeHeight = layout.searchModeHeight;
const modeInset = (fullHeight - modeHeight) / 2;
const backCenter = modeInset + modeHeight / 2;
const glyphCenter =
  modeInset + modeHeight + layout.searchModeGap + layout.searchFieldInset + layout.searchFieldIconSize / 2;
const glyphFromScale = layout.searchIconSize / layout.searchFieldIconSize;
const textFrom = -(layout.searchFieldIconSize + space[4]);

const clamp01 = (value: number) => {
  'worklet';
  return Math.min(1, Math.max(0, value));
};

interface Props {
  active: boolean;
  mode: SharedValue<number>;
  backTab: TabConfig;
  backPress: ReturnType<typeof useGlassPress>;
  travel?: {
    index: number;
    slotWidth: SharedValue<number>;
    circle: SharedValue<number>;
    press: SharedValue<number>;
    target: SharedValue<number>;
    fit: SharedValue<{ scale: number; x: number; y: number }>;
  };
  onBack: () => void;
}

export const SearchMode = ({ active, mode, backTab, backPress, travel, onBack }: Props) => {
  const { color, scheme } = useTheme();
  const iconDim = motion.pressIconDim[scheme];
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

  const travelIndex = travel?.index ?? 0;
  const travelWidth = travel?.slotWidth;
  const travelCircle = travel?.circle;
  const travelPress = travel?.press;
  const travelTarget = travel?.target;
  const travelFit = travel?.fit;
  const backStyle = useAnimatedStyle(() => ({
    opacity: travelWidth ? (mode.get() > motion.backTravel.handoff ? 1 : 0) : clamp01(mode.get() * 2 - 0.6),
    transform: [{ scale: 1 + backPress.press.get() * motion.pressGrow }],
  }));
  const backOutlineStyle = useAnimatedStyle(() => ({
    opacity: travelTarget && travelTarget.get() === 0 ? 0 : 1,
  }));
  const backFilledStyle = useAnimatedStyle(() => ({
    opacity: travelTarget && travelTarget.get() === 0 ? 1 : 0,
  }));
  const backFillStyle = useAnimatedStyle(() => ({ opacity: backPress.press.get() }));
  const backInkStyle = useAnimatedStyle(() => {
    const away = travelWidth ? 1 - clamp01(mode.get()) : 0;
    const fit = travelFit ? travelFit.get() : { scale: 1, x: 0, y: 0 };
    const fromX = travelWidth
      ? fit.x + fit.scale * (layout.tabBarInlinePadding + (travelIndex + 0.5) * travelWidth.get()) - backCenter
      : 0;
    const fromY = fit.y + fit.scale * (fullHeight - layout.tabLabelHeight) * 0.5 - backCenter;
    return {
      opacity: 1 - backPress.press.get() * iconDim,
      transform: [{ translateX: fromX * away }, { translateY: fromY * away }],
    };
  });
  const rowWidth = useSharedValue(0);
  const fieldStyle = useAnimatedStyle(() => {
    if (!travelWidth) {
      return { opacity: clamp01(mode.get() * 2 - 1) };
    }
    return {
      transform: [
        {
          translateX:
            ((travelCircle ? travelCircle.get() : rowWidth.get() - fullHeight / 2) - glyphCenter) *
            (1 - clamp01(mode.get())),
        },
      ],
    };
  });
  const glyphStyle = useAnimatedStyle(() =>
    travelWidth
      ? {
          opacity: mode.get() > motion.backTravel.handoff ? 1 : 0,
          transform: [
            {
              scale:
                1 +
                (glyphFromScale * (1 + (travelPress ? travelPress.get() : 0) * motion.pressGrow) - 1) *
                  (1 - clamp01(mode.get())),
            },
          ],
        }
      : {},
  );
  const glyphAccentStyle = useAnimatedStyle(() => ({
    opacity: travelTarget && travelTarget.get() === 1 ? 1 - clamp01(mode.get() * motion.searchTabs.pressFade) : 0,
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textFrom * (1 - clamp01(mode.get())) }],
    opacity:
      mode.get() >= motion.backTravel.settle
        ? 0
        : !travelTarget || travelTarget.get() === 1
          ? clamp01(mode.get() * motion.backTravel.textRate - motion.backTravel.textDelay)
          : clamp01((mode.get() - motion.searchClose.fadeFrom) / (1 - motion.searchClose.fadeFrom)),
  }));
  const inputStyle = useAnimatedStyle(() => ({
    opacity: !travelWidth || mode.get() >= motion.backTravel.settle ? 1 : 0,
  }));
  const textBlurProps = useAnimatedProps(() => ({
    radius: travelWidth ? (1 - clamp01(mode.get())) * motion.searchTabs.textBlur : 0,
  }));

  const onRowLayout = (event: LayoutChangeEvent) => {
    rowWidth.set(event.nativeEvent.layout.width);
  };

  const goBack = () => {
    Keyboard.dismiss();
    onBack();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={active ? 'box-none' : 'none'} onLayout={onRowLayout}>
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
            <Animated.View style={backOutlineStyle}>
              <Icon name={backTab.icon} size={layout.tabIconSize} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.center, backFilledStyle]}>
              <Icon name={backTab.icon} variant="fill" size={layout.tabIconSize} tone="accent" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.field, fieldStyle]}>
        <Animated.View style={glyphStyle}>
          <Icon name="search" size={layout.searchFieldIconSize} />
          <Animated.View style={[StyleSheet.absoluteFill, glyphAccentStyle]}>
            <Icon name="search" size={layout.searchFieldIconSize} tone="accent" />
          </Animated.View>
        </Animated.View>
        <View style={styles.text}>
          <Animated.View style={[styles.layer, inputStyle]}>
            <TextInput
              ref={input}
              style={[styles.input, searchFieldText[scheme], { color: color.text.primary }]}
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
          {travelWidth && (
            <AnimatedNativeGlassBlur
              style={[styles.layer, textStyle]}
              animatedProps={textBlurProps}
              pointerEvents="none">
              <Text
                style={[
                  styles.input,
                  searchFieldText[scheme],
                  { color: query ? color.text.primary : color.text.placeholder },
                ]}
                numberOfLines={1}>
                {query || searchPlaceholder}
              </Text>
            </AnimatedNativeGlassBlur>
          )}
        </View>
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
  text: {
    flex: 1,
    alignSelf: 'stretch',
  },
  layer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.body.fontSize,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
