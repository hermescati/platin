import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AndroidHaptics, performAndroidHapticsAsync } from 'expo-haptics';
import { useTabTrigger } from 'expo-router/ui';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AnimatedNativeGlassView, NativeGlassView } from '@/components/glass/NativeGlass';
import { useGlassStyle } from '@/components/glass/useGlassStyle';
import { useKeyboardHeight } from '@/components/keyboard/useKeyboardHeight';
import { useSearchQuery } from '@/components/search/SearchQuery';
import { SearchMode } from '@/components/tab-bar/SearchMode';
import { setTabBarCollapsed, useTabBarCollapse } from '@/components/tab-bar/TabBarCollapse';
import { primaryTabs as tabs, searchTab, type TabConfig } from '@/components/tab-bar/tabs';
import { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { useTabBarOffset } from '@/components/tab-bar/useTabBarInset';
import { fontSize, glass, layout, motion, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const tabCount = tabs.length;
const lastIndex = tabCount - 1;
const middleIndex = lastIndex / 2;
const lensLiftDelta = motion.lensLift - 1;
const rowInset = spacing.xxs + layout.glassRim;
const fullHeight = layout.tabBarHeight;
const compactScaleY = layout.tabBarCompactHeight / fullHeight;
const lensFullHeight = fullHeight - rowInset * 2;
const lensCompactScaleY = (layout.tabBarCompactHeight - rowInset * 2) / lensFullHeight;
const labelShift = (layout.tabLabelHeight + spacing.xxs) / 2;

const clamp01 = (value: number) => {
  'worklet';
  return Math.min(1, Math.max(0, value));
};

const lerp = (from: number, to: number, progress: number) => {
  'worklet';
  return from + (to - from) * progress;
};

const clampIndex = (value: number) => {
  'worklet';
  return Math.min(lastIndex, Math.max(0, value));
};

const tick = () => {
  performAndroidHapticsAsync(AndroidHaptics.Segment_Tick);
};

interface TabItemProps {
  tab: TabConfig;
  index: number;
  selected: boolean;
  lensPosition: SharedValue<number>;
  lift: SharedValue<number>;
  presence: SharedValue<number>;
  collapsed: SharedValue<number>;
  itemShift: SharedValue<number>;
  barShiftX: SharedValue<number>;
  barShiftY: SharedValue<number>;
  onActivate: (index: number) => void;
}

const TabItem = ({
  tab,
  index,
  selected,
  lensPosition,
  lift,
  presence,
  collapsed,
  itemShift,
  barShiftX,
  barShiftY,
  onActivate,
}: TabItemProps) => {
  const { color } = useTheme();
  const proximity = useDerivedValue(() => 1 - Math.min(1, Math.abs(index - lensPosition.get())));

  const itemStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: barShiftX.get() + (index - middleIndex) * itemShift.get() },
      { translateY: barShiftY.get() + collapsed.get() * labelShift },
      { scale: 1 + lift.get() * proximity.get() * motion.itemMagnify },
    ],
  }));
  const highlight = useDerivedValue(() => proximity.get() * Math.max(presence.get(), lift.get()));
  const activeStyle = useAnimatedStyle(() => ({ opacity: highlight.get() }));
  const idleStyle = useAnimatedStyle(() => ({ opacity: 1 - highlight.get() }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, collapsed.get() * motion.labelFadeRate),
  }));

  return (
    <View
      style={styles.slot}
      accessible
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onActivate(index)}>
      <Animated.View style={[styles.item, itemStyle]}>
        <View>
          <Animated.View style={idleStyle}>
            <MaterialIcons
              name={tab.icon}
              size={layout.tabIconSize}
              color={color.textSecondary}
              style={[styles.legible, { textShadowColor: color.tabLegibilityShadow }]}
            />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeStyle]}>
            <MaterialIcons
              name={tab.icon}
              size={layout.tabIconSize}
              color={color.accent}
              style={[styles.legible, { textShadowColor: color.tabLegibilityShadow }]}
            />
          </Animated.View>
        </View>
        <Animated.View style={[styles.labelBox, labelStyle]}>
          <Animated.Text
            style={[
              styles.label,
              styles.legible,
              {
                color: color.textSecondary,
                textShadowColor: color.tabLegibilityShadow,
              },
              idleStyle,
            ]}
            numberOfLines={1}>
            {tab.label}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.label,
              styles.labelOverlay,
              styles.legible,
              {
                color: color.accent,
                textShadowColor: color.tabLegibilityShadow,
              },
              activeStyle,
            ]}
            numberOfLines={1}>
            {tab.label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export const FloatingTabBar = () => {
  const bottom = useTabBarOffset();
  const { color } = useTheme();
  const collapse = useTabBarCollapse();
  const { getTrigger, switchTab } = useTabTrigger({ name: tabs[0].name });
  const focusedIndex = tabs.findIndex((tab) => getTrigger(tab.name)?.isFocused);
  const searchFocused = getTrigger(searchTab.name)?.isFocused ?? false;
  const { setQuery } = useSearchQuery();
  const keyboardHeight = useKeyboardHeight();
  const [backIndex, setBackIndex] = useState(Math.max(focusedIndex, 0));
  if (focusedIndex >= 0 && focusedIndex !== backIndex) {
    setBackIndex(focusedIndex);
  }

  const fallbackCollapsed = useSharedValue(0);
  const collapsed = collapse?.progress ?? fallbackCollapsed;
  const barWidth = useSharedValue(0);
  const lensPosition = useSharedValue(Math.max(focusedIndex, 0));
  const lift = useSharedValue(0);
  const leftEdge = useSharedValue(0);
  const rightEdge = useSharedValue(0);
  const leftTarget = useSharedValue(0);
  const rightTarget = useSharedValue(0);
  const restSpan = useSharedValue(0);
  const edgesReady = useSharedValue(false);
  const previousCollapsed = useSharedValue(0);
  const previousLensPosition = useSharedValue(Math.max(focusedIndex, 0));
  const focused = useSharedValue(focusedIndex);
  const settledIndex = useSharedValue(focusedIndex);
  const dragIndex = useSharedValue(-1);
  const expandOnly = useSharedValue(false);
  const moved = useSharedValue(false);
  const lensPresence = useSharedValue(focusedIndex >= 0 ? 1 : 0);
  const searchPress = useGlassPress();
  const backPress = useGlassPress();
  const glassStyle = useGlassStyle();
  const nudge = useSharedValue(0);
  const pressSquash = useSharedValue(0);
  const searchMode = useSharedValue(searchFocused ? 1 : 0);
  const searchPulse = useSharedValue(0);

  const scaleX = useDerivedValue(() => lerp(1, layout.tabBarCompactWidthRatio, collapsed.get()));
  const scaleY = useDerivedValue(() => lerp(1, compactScaleY, collapsed.get()));
  const fullItemWidth = useDerivedValue(() => (barWidth.get() - rowInset * 2) / tabCount);
  const itemWidth = useDerivedValue(() => (barWidth.get() * scaleX.get() - rowInset * 2) / tabCount);
  const itemShift = useDerivedValue(() => itemWidth.get() - fullItemWidth.get());
  const barShiftY = useDerivedValue(() => (fullHeight * (1 - scaleY.get())) / 2);
  const centerShiftX = useDerivedValue(
    () => (barWidth.get() * (1 - scaleX.get()) + fullHeight * (1 - scaleY.get())) / 2,
  );
  const barShiftX = useDerivedValue(() => -(barWidth.get() * (1 - scaleX.get())) / 2 + centerShiftX.get());
  const pillShiftX = useDerivedValue(() => barShiftX.get() + nudge.get());
  const searchShiftX = useDerivedValue(() => -(fullHeight * (1 - scaleY.get())) / 2);
  const searchSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -barWidth.get() * (1 - scaleX.get()) + centerShiftX.get() }],
  }));

  useEffect(() => {
    focused.set(focusedIndex);
    if (focusedIndex >= 0 && dragIndex.get() < 0 && settledIndex.get() !== focusedIndex) {
      lensPosition.set(withSpring(focusedIndex, motion.springs.lens));
    }
    settledIndex.set(focusedIndex);
    lensPresence.set(withSpring(focusedIndex >= 0 ? 1 : 0, motion.springs.morph));
    if (collapse) {
      setTabBarCollapsed(collapse, 0);
    }
  }, [focusedIndex, focused, settledIndex, dragIndex, lensPosition, lensPresence, collapse]);

  useEffect(() => {
    searchMode.set(withSpring(searchFocused ? 1 : 0, motion.springs.searchMorph));
    searchPulse.set(withSequence(withSpring(1, motion.springs.track), withSpring(0, motion.springs.edgeSettle)));
  }, [searchFocused, searchMode, searchPulse]);

  const selectTab = (index: number) => {
    requestAnimationFrame(() => switchTab(tabs[index].name, {}));
  };

  const onPillLayout = (event: LayoutChangeEvent) => {
    barWidth.set(event.nativeEvent.layout.width);
  };

  const openSearch = () => {
    tick();
    switchTab(searchTab.name, {});
  };

  const leaveSearch = () => {
    tick();
    switchTab(tabs[backIndex].name, {});
  };

  const closeSearch = () => {
    setQuery('');
    Keyboard.dismiss();
    leaveSearch();
  };

  const positionAt = (x: number) => {
    'worklet';
    return clampIndex((x - barWidth.get() / 2 - barShiftX.get()) / itemWidth.get() + middleIndex);
  };

  const pan = usePanGesture({
    enabled: !searchFocused,
    minDistance: 0,
    onBegin: (event) => {
      if (collapse && collapse.target.get() === 1) {
        expandOnly.set(true);
        setTabBarCollapsed(collapse, 0);
        return;
      }
      const index = Math.round(positionAt(event.x));
      if (index !== focused.get()) {
        scheduleOnRN(tick);
      }
      dragIndex.set(index);
      moved.set(false);
      lensPresence.set(withSpring(1, motion.springs.lift));
      pressSquash.set(withSequence(withSpring(1, motion.springs.track), withSpring(0, motion.springs.edgeSettle)));
      lift.set(withSpring(1, motion.springs.lift));
      lensPosition.set(withSpring(index, motion.springs.lens));
    },
    onUpdate: (event) => {
      if (expandOnly.get()) {
        return;
      }
      if (!moved.get() && Math.abs(event.translationX) < motion.dragThreshold) {
        return;
      }
      moved.set(true);
      const width = barWidth.get();
      const inner =
        event.x < rowInset ? event.x - rowInset : event.x > width - rowInset ? event.x - (width - rowInset) : 0;
      const rubber = Math.sign(inner) * motion.nudgeMax * (1 - 1 / (1 + Math.abs(inner) / motion.nudgeRange));
      const follow = width > 0 ? ((event.x - width / 2) / (width / 2)) * motion.nudgeFollow : 0;
      nudge.set(withSpring(rubber + follow, motion.springs.track));
      const position = positionAt(event.x);
      lensPosition.set(withSpring(position, motion.springs.track));
      const index = Math.round(position);
      if (index !== dragIndex.get()) {
        dragIndex.set(index);
        scheduleOnRN(tick);
      }
    },
    onFinalize: (event) => {
      if (expandOnly.get()) {
        expandOnly.set(false);
        return;
      }
      const committed = !event.canceled || !moved.get();
      const index = committed ? dragIndex.get() : focused.get();
      dragIndex.set(-1);
      nudge.set(withSpring(0, motion.springs.edgeSettle));
      const settle = withSpring(0, motion.springs.morph);
      lift.set(moved.get() ? settle : withDelay(motion.tapHold, settle));
      if (index >= 0) {
        lensPosition.set(withSpring(index, motion.springs.lens));
        settledIndex.set(index);
        if (committed && index !== focused.get()) {
          scheduleOnRN(selectTab, index);
        } else if (focused.get() < 0) {
          lensPresence.set(withSpring(0, motion.springs.morph));
        }
      }
    },
  });

  useFrameCallback(() => {
    const width = itemWidth.get();
    if (width <= 0) {
      return;
    }
    const position = lensPosition.get();
    const direction = Math.sign(position - previousLensPosition.get());
    previousLensPosition.set(position);

    const center = barWidth.get() / 2 + pillShiftX.get() + (position - middleIndex) * width;
    const halfWidth = (width / 2) * (1 + lift.get() * lensLiftDelta);
    const left = center - halfWidth;
    const right = center + halfWidth;
    restSpan.set(halfWidth * 2);

    const collapsing = collapsed.get() !== previousCollapsed.get();
    previousCollapsed.set(collapsed.get());

    if (!edgesReady.get() || (collapsing && lift.get() === 0)) {
      edgesReady.set(true);
      leftEdge.set(left);
      rightEdge.set(right);
      leftTarget.set(left);
      rightTarget.set(right);
      return;
    }

    const settling = direction === 0;
    if (Math.abs(left - leftTarget.get()) > motion.edgeEpsilon) {
      leftTarget.set(left);
      const config = settling
        ? motion.springs.edgeSettle
        : direction < 0
          ? motion.springs.edgeLead
          : motion.springs.edgeTrail;
      leftEdge.set(withSpring(left, config));
    }
    if (Math.abs(right - rightTarget.get()) > motion.edgeEpsilon) {
      rightTarget.set(right);
      const config = settling
        ? motion.springs.edgeSettle
        : direction > 0
          ? motion.springs.edgeLead
          : motion.springs.edgeTrail;
      rightEdge.set(withSpring(right, config));
    }
  });

  const lensGlowStyle = useAnimatedStyle(() => ({ opacity: lift.get() }));

  const lensGeometry = useDerivedValue(() => {
    const fullWidth = fullItemWidth.get();
    const left = leftEdge.get();
    const right = rightEdge.get();
    const span = Math.max(0, right - left);
    const liftScale = 1 + lift.get() * lensLiftDelta;
    const rest = restSpan.get();
    const stretchRatio = rest > 0 ? span / rest : 1;
    const squash = Math.min(
      1 / motion.minLensSquash,
      Math.max(motion.minLensSquash, 1 / Math.sqrt(Math.max(stretchRatio, 0.01))),
    );
    return {
      translateX: (left + right) / 2 - rowInset - fullWidth / 2,
      translateY: barShiftY.get(),
      scaleX: (fullWidth > 0 ? Math.max(span / fullWidth, 0.01) : 1) * (1 + pressSquash.get() * motion.pressSquashX),
      scaleY:
        lerp(1, lensCompactScaleY, collapsed.get()) *
        liftScale *
        squash *
        (1 - pressSquash.get() * motion.pressSquashY),
    };
  });

  const lensStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      width: fullItemWidth.get(),
      opacity: edgesReady.get() ? Math.max(lensPresence.get(), lift.get()) : 0,
      transform: [
        { translateX: geometry.translateX },
        { translateY: geometry.translateY },
        { scaleX: geometry.scaleX },
        { scaleY: geometry.scaleY },
      ],
    };
  });

  const lensGlassStyle = useAnimatedStyle(() => ({ opacity: lift.get() }));

  const searchScale = useDerivedValue(
    () =>
      scaleY.get() * (1 + searchPress.press.get() * motion.pressGrow) * (1 + searchPulse.get() * motion.searchPulse),
  );
  const searchGlowStyle = useAnimatedStyle(() => ({ opacity: searchPress.press.get() }));

  const barLiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(0, keyboardHeight.get() + bottom - spacing.sm) * clamp01(searchMode.get()) }],
  }));

  const pillModeStyle = useAnimatedStyle(() => ({ opacity: 1 - clamp01(searchMode.get() * 2.5) }));
  const searchContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: searchShiftX.get() }, { translateY: barShiftY.get() }, { scale: searchScale.get() }],
  }));

  const barGlassProps = useAnimatedProps(() => {
    const width = barWidth.get();
    if (width <= 0) {
      return { shapes: [], blend: 0 };
    }
    const mode = searchMode.get();
    const settled = clamp01(mode);
    const detach = clamp01((mode - motion.searchDetach) / (1 - motion.searchDetach));
    const pad = glass.pad;

    const pillLeft = pillShiftX.get() + (width - width * scaleX.get()) / 2;
    const pillRight = pillLeft + width * scaleX.get();
    const pillTop = fullHeight * (1 - scaleY.get());
    const backGrow = (fullHeight / 2) * motion.pressGrow * backPress.press.get() * settled;
    const backLeft = pillLeft - backGrow;
    const backRight = lerp(pillRight, pillLeft + fullHeight, settled) + backGrow;
    const backTop = lerp(pillTop, 0, settled) - backGrow;
    const backBottom = fullHeight + backGrow;

    const slide = -width * (1 - scaleX.get()) + centerShiftX.get();
    const circleX = width + layout.tabBarGap + slide + fullHeight / 2 + searchShiftX.get();
    const circleY = fullHeight / 2 + barShiftY.get();
    const circleRadius = (fullHeight / 2) * searchScale.get();

    const fieldLeft = lerp(circleX - circleRadius, fullHeight + layout.tabBarGap, settled);
    const fieldRight = lerp(circleX + circleRadius, width, detach);
    const fieldTop = lerp(circleY - circleRadius, 0, settled);
    const fieldBottom = lerp(circleY + circleRadius, fullHeight, settled);

    return {
      blend: glass.blend * clamp01(mode * 3),
      shapes: [
        backLeft + pad,
        backTop + pad,
        backRight + pad,
        backBottom + pad,
        circleX - circleRadius + pad,
        circleY - circleRadius + pad,
        circleX + circleRadius + pad,
        circleY + circleRadius + pad,
        fieldLeft + pad,
        fieldTop + pad,
        fieldRight + pad,
        fieldBottom + pad,
      ],
    };
  });
  const searchGlyphStyle = useAnimatedStyle(() => ({ opacity: 1 - clamp01(searchMode.get() * 2) }));
  const closeGlyphStyle = useAnimatedStyle(() => ({ opacity: clamp01(searchMode.get() * 2 - 1) }));

  const lensFillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(lift.get(), [0, 1], [color.lens, color.lensActive]),
  }));

  return (
    <Animated.View style={[styles.bar, { bottom }, barLiftStyle]} pointerEvents="box-none">
      <AnimatedNativeGlassView
        style={styles.barGlass}
        pointerEvents="none"
        animatedProps={barGlassProps}
        {...glassStyle}
      />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.frame, pillModeStyle]}
          pointerEvents={searchFocused ? 'none' : 'auto'}
          accessibilityRole="tablist"
          onLayout={onPillLayout}>
          <Animated.View pointerEvents="none" style={[styles.lens, lensStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, lensGlassStyle]}>
              <NativeGlassView
                style={StyleSheet.absoluteFill}
                cornerRadius={lensFullHeight / 2}
                blurRadius={glass.lensBlurRadius}
                bezel={glass.lensBezel}
                refraction={glass.lensRefraction}
                magnify={glass.lensMagnify}
              />
            </Animated.View>
            <Animated.View style={[styles.lensLayer, { boxShadow: color.lensInnerShadow }, lensFillStyle]} />
            <Animated.View style={[styles.lensLayer, { boxShadow: color.lensGlow }, lensGlowStyle]} />
          </Animated.View>
          <View style={styles.row} pointerEvents="box-none">
            {tabs.map((tab, index) => (
              <TabItem
                key={tab.name}
                tab={tab}
                index={index}
                selected={index === focusedIndex}
                lensPosition={lensPosition}
                lift={lift}
                presence={lensPresence}
                collapsed={collapsed}
                itemShift={itemShift}
                barShiftX={pillShiftX}
                barShiftY={barShiftY}
                onActivate={selectTab}
              />
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
      <Animated.View style={[styles.search, searchSlideStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={searchFocused ? closeSearch : openSearch}
          onPressIn={searchPress.onPressIn}
          onPressOut={searchPress.onPressOut}
          accessibilityRole="tab"
          accessibilityLabel={searchFocused ? 'Close search' : searchTab.label}
          accessibilityState={{ selected: searchFocused }}>
          <Animated.View style={[StyleSheet.absoluteFill, searchContentStyle]}>
            <Animated.View style={[styles.glow, { boxShadow: color.lensGlow }, searchGlowStyle]} />
            <Animated.View style={styles.searchIcon}>
              <Animated.View style={[styles.searchIcon, searchGlyphStyle]}>
                <MaterialIcons
                  name={searchTab.icon}
                  size={layout.searchIconSize}
                  color={color.textPrimary}
                  style={[styles.legible, { textShadowColor: color.tabLegibilityShadow }]}
                />
              </Animated.View>
              <Animated.View style={[styles.searchIcon, closeGlyphStyle]}>
                <MaterialIcons
                  name="close"
                  size={layout.searchIconSize}
                  color={color.textPrimary}
                  style={[styles.legible, { textShadowColor: color.tabLegibilityShadow }]}
                />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
      <SearchMode
        active={searchFocused}
        mode={searchMode}
        backTab={tabs[backIndex]}
        backPress={backPress}
        onBack={leaveSearch}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: layout.tabBarSideInset,
    right: layout.tabBarSideInset,
    flexDirection: 'row',
    gap: layout.tabBarGap,
  },
  barGlass: {
    position: 'absolute',
    top: -glass.pad,
    left: -glass.pad,
    right: -glass.pad,
    bottom: -glass.pad,
  },
  frame: {
    flex: 1,
    height: fullHeight,
  },
  search: {
    width: fullHeight,
    height: fullHeight,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: fullHeight / 2,
  },
  searchIcon: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lens: {
    position: 'absolute',
    top: rowInset,
    left: rowInset,
    height: lensFullHeight,
    borderRadius: lensFullHeight / 2,
    overflow: 'hidden',
  },
  lensLayer: {
    ...StyleSheet.absoluteFill,
    borderRadius: lensFullHeight / 2,
  },
  row: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    padding: rowInset,
  },
  slot: {
    flex: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  labelBox: {
    alignSelf: 'stretch',
    height: layout.tabLabelHeight,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  legible: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: layout.legibilityShadowRadius,
  },
  labelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
