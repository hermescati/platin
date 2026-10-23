import { AndroidHaptics, performAndroidHapticsAsync } from 'expo-haptics';
import { useTabTrigger } from 'expo-router/ui';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedReaction,
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

import { AnimatedNativeGlassBlur, AnimatedNativeGlassView, NativeGlassBackdrop } from '@/components/glass/NativeGlass';
import { forcePlainGlass } from '@/components/glass/plainGlass';
import { useGlassStyle } from '@/components/glass/useGlassStyle';
import { Icon } from '@/components/icon/Icon';
import { useKeyboardHeight } from '@/components/keyboard/useKeyboardHeight';
import { useSearchQuery } from '@/components/search/SearchQuery';
import { SearchMode } from '@/components/tab-bar/SearchMode';
import { setTabBarCollapsed, useTabBarCollapse } from '@/components/tab-bar/TabBarCollapse';
import { primaryTabs as tabs, searchTab, type TabConfig } from '@/components/tab-bar/tabs';
import { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { useTabBarOffset } from '@/components/tab-bar/useTabBarInset';
import { glass, layout, motion, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const tabCount = tabs.length;
const lastIndex = tabCount - 1;
const middleIndex = lastIndex / 2;
const rowInset = space[4];
const inlinePad = layout.tabBarInlinePadding;
const fullHeight = layout.tabBarHeight;
const lensFullHeight = fullHeight - rowInset * 2;
const lensCompactScaleY = (layout.tabBarCompactHeight - rowInset * 2) / lensFullHeight;
const labelShift = layout.tabLabelHeight / 2;
const modeHeight = layout.searchModeHeight;
const modeInset = (fullHeight - modeHeight) / 2;
const modeRadius = modeHeight / 2;
const modeShrink = modeHeight / fullHeight;
const fieldGlyphCenter =
  modeInset + modeHeight + layout.searchModeGap + layout.searchFieldInset + layout.searchFieldIconSize / 2;
const tabBarGroup = 'tabbar';
const screenGroup = 'default';
const revealGroup = 'tabbar-reveal';

const clamp01 = (value: number) => {
  'worklet';
  return Math.min(1, Math.max(0, value));
};

const mixHex = (from: string, to: string, progress: number) => {
  const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
  const mixed = [1, 3, 5].map((at) => Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * progress));
  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
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
  shine: SharedValue<number>;
  presence: SharedValue<number>;
  collapsed: SharedValue<number>;
  collapseX: SharedValue<number>;
  collapseSpread: SharedValue<number>;
  handoff?: SharedValue<number>;
  revealed?: boolean;
  activeInk: string;
  onActivate: (index: number) => void;
}

const TabItem = ({
  tab,
  index,
  selected,
  lensPosition,
  lift,
  shine,
  presence,
  collapsed,
  collapseX,
  collapseSpread,
  handoff,
  revealed = false,
  activeInk,
  onActivate,
}: TabItemProps) => {
  const { color } = useTheme();
  const proximity = useDerivedValue(() => 1 - Math.min(1, Math.abs(index - lensPosition.get())));
  const chosen = useSharedValue(Math.round(lensPosition.get()) === index ? 1 : 0);
  useAnimatedReaction(
    () => (Math.round(lensPosition.get()) === index ? 1 : 0),
    (next, previous) => {
      if (next !== previous) {
        chosen.set(withSpring(next, motion.springs.snappy));
      }
    },
  );

  const itemStyle = useAnimatedStyle(() => ({
    opacity: lerp(1, chosen.get(), clamp01(collapsed.get() * motion.labelFadeRate)),
    transform: [
      { translateX: collapseX.get() + (index - middleIndex) * collapseSpread.get() },
      { translateY: collapsed.get() * labelShift },
      { scale: 1 + lift.get() * proximity.get() * motion.itemMagnify },
    ],
  }));
  const highlight = useDerivedValue(() =>
    revealed
      ? 1
      : chosen.get() *
        presence.get() *
        clamp01((motion.highlightFade.from - lift.get()) / (motion.highlightFade.from - motion.highlightFade.to)),
  );
  const activeStyle = useAnimatedStyle(() => ({ opacity: highlight.get() }));
  const glow = useDerivedValue(() => (revealed ? shine.get() : 0));
  const activeRestStyle = useAnimatedStyle(() => ({ opacity: highlight.get() }));
  const activeLiftStyle = useAnimatedStyle(() => ({
    opacity: highlight.get() * glow.get(),
  }));
  const idleStyle = useAnimatedStyle(() => ({ opacity: 1 - highlight.get() }));
  const handoffStyle = useAnimatedStyle(() => ({
    opacity: handoff && handoff.get() > motion.backTravel.handoff ? 0 : 1,
  }));
  const activeLabelColor = useAnimatedStyle(() => ({
    color: interpolateColor(glow.get(), [0, 1], [activeInk, color.chrome.tabAccent]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, collapsed.get() * motion.labelFadeRate),
  }));

  return (
    <View
      style={styles.slot}
      accessible={!revealed}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onActivate(index)}>
      <Animated.View style={[styles.item, itemStyle]}>
        <Animated.View style={handoffStyle}>
          <Animated.View style={idleStyle}>
            <Icon name={tab.icon} size={layout.tabIconSize} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeRestStyle]}>
            <Icon name={tab.icon} variant="fill" size={layout.tabIconSize} color={activeInk} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeLiftStyle]}>
            <Icon name={tab.icon} variant="fill" size={layout.tabIconSize} color={color.chrome.tabAccent} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.labelBox, labelStyle]}>
          <Animated.Text
            style={[
              styles.label,
              styles.legible,
              {
                color: color.text.primary,
                textShadowColor: color.chrome.legibilityShadow,
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
                textShadowColor: color.chrome.legibilityShadow,
              },
              activeStyle,
              activeLabelColor,
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
  const window = useWindowDimensions();
  const barSpan = Math.min(window.width - layout.tabBarSideInset * 2, layout.tabBarMaxWidth);
  const barLeft = (window.width - barSpan) / 2;
  const { color, scheme } = useTheme();
  const iconDim = motion.pressIconDim[scheme];
  const collapse = useTabBarCollapse();
  const { getTrigger, switchTab } = useTabTrigger({ name: tabs[0].name });
  const focusedIndex = tabs.findIndex((tab) => getTrigger(tab.name)?.isFocused);
  const searchFocused = getTrigger(searchTab.name)?.isFocused ?? false;
  const { setQuery } = useSearchQuery();
  const keyboardHeight = useKeyboardHeight();
  const [backIndex, setBackIndex] = useState(Math.max(focusedIndex, 0));
  const [activeInk, setActiveInk] = useState(color.chrome.tabActive);
  const onBackdropLuma = useCallback(
    (event: { nativeEvent: { luma: number } }) => {
      const { from, to, step } = glass.inkLuma;
      const tone = Math.round(clamp01((event.nativeEvent.luma - from) / (to - from)) / step) * step;
      setActiveInk(mixHex(color.chrome.tabActiveOver, color.chrome.tabActive, tone));
    },
    [color.chrome.tabActive, color.chrome.tabActiveOver],
  );
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
  const modeTarget = useSharedValue(searchFocused ? 1 : 0);
  const searchBump = useSharedValue(0);
  const backBump = useSharedValue(0);
  const searchPop = useSharedValue(searchFocused ? 1 : 0);
  const moving = useSharedValue(0);
  const push = useSharedValue(0);
  const jelly = useSharedValue(0);
  const jellyVelocity = useSharedValue(0);
  const smoothSpeed = useSharedValue(0);
  const dragOrigin = useSharedValue(0);
  const heading = useSharedValue(0);
  const atEnd = useSharedValue(true);
  const squish = useSharedValue(0);
  const barPress = useSharedValue(0);
  const barGrowth = useSharedValue(0);
  const tapSlide = useSharedValue(0);
  const settleOnArrival = useSharedValue(false);
  const settleAt = useSharedValue(-1);
  const dragRelease = useSharedValue(0);
  const sliding = useSharedValue(false);
  const slideFrom = useSharedValue(0);
  const slideTo = useSharedValue(0);
  const slideRight = useSharedValue(true);
  const tapStay = useSharedValue(0);
  const landing = useSharedValue(0);
  const dripColour = useSharedValue(0);
  const dripShape = useSharedValue(0);
  const tapDipping = useSharedValue(false);
  const gliding = useSharedValue(false);
  const glideTo = useSharedValue(0);
  const glideSpan = useSharedValue(1);
  const slideShape = useDerivedValue(() => tapSlide.get() * (1 - tapStay.get()) * motion.tapSlide.canal);
  const shine = useDerivedValue(() => lift.get() * (1 - slideShape.get()));
  const held = useDerivedValue(() => lerp(1, barPress.get(), tapStay.get()));
  const squishVelocity = useSharedValue(0);
  const wallSide = useSharedValue(0);
  const approachSpeed = useSharedValue(0);
  const movingTarget = useSharedValue(0);

  const compactPop = useSharedValue(0);
  useAnimatedReaction(
    () => collapse?.target.get() ?? 0,
    (target, previous) => {
      if (target === 1 && previous === 0) {
        compactPop.set(
          withDelay(
            motion.compactPop.delay,
            withSequence(
              withSpring(motion.compactPop.depth, motion.springs.compactPopIn),
              withSpring(0, motion.springs.compactPopOut),
            ),
          ),
        );
      } else if (target === 0) {
        compactPop.set(0);
      }
    },
  );
  const compactSize = useDerivedValue(() => layout.tabBarCompactHeight * (1 - compactPop.get()));
  const scaleX = useDerivedValue(() => lerp(1, compactSize.get() / Math.max(barWidth.get(), 1), collapsed.get()));
  const scaleY = useDerivedValue(() => lerp(1, compactSize.get() / fullHeight, collapsed.get()));
  const fullItemWidth = useDerivedValue(() => (barWidth.get() - inlinePad * 2) / tabCount);
  const itemWidth = useDerivedValue(() => (barWidth.get() * scaleX.get() - inlinePad * 2) / tabCount);
  const barShiftX = useDerivedValue(
    () => -(barWidth.get() * (1 - scaleX.get())) / 2 + (fullHeight * (1 - scaleY.get())) / 2,
  );
  const pillShiftX = useDerivedValue(() => barShiftX.get() + nudge.get());
  const collapseX = useDerivedValue(() => nudge.get() + collapsed.get() * (fullHeight / 2 - barWidth.get() / 2));
  const collapseSpread = useDerivedValue(() => -fullItemWidth.get() * collapsed.get());

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

  const morphSearch = useCallback(
    (open: boolean) => {
      const target = open ? 1 : 0;
      if (modeTarget.get() === target) {
        return;
      }
      modeTarget.set(target);
      if (open) {
        searchBump.set(withSpring(0, motion.springs.searchBumpOut));
        searchMode.set(withSpring(1, { ...motion.springs.searchOpen, velocity: motion.searchMorph.openVelocity }));
        searchPop.set(withDelay(motion.searchPop.delay, withSpring(1, motion.springs.searchPop)));
      } else {
        searchPop.set(withSpring(0, motion.springs.searchAbsorb));
        searchMode.set(withSpring(0, motion.springs.searchMorph));
      }
    },
    [modeTarget, searchMode, searchPop, searchBump],
  );

  useAnimatedReaction(
    () => modeTarget.get() === 0 && searchMode.get() < 1 - motion.searchBump.at,
    (hit, previous) => {
      if (hit && previous === false) {
        searchBump.set(
          withSequence(withSpring(1, motion.springs.searchBumpIn), withSpring(0, motion.springs.searchBumpOut)),
        );
      }
    },
  );

  useAnimatedReaction(
    () => modeTarget.get() === 1 && searchMode.get() > motion.searchBump.at,
    (hit, previous) => {
      if (hit && previous === false) {
        backBump.set(
          withSequence(withSpring(1, motion.springs.searchBumpIn), withSpring(0, motion.springs.searchBumpOut)),
        );
      }
    },
  );

  useEffect(() => {
    morphSearch(searchFocused);
  }, [searchFocused, morphSearch]);

  const selectTab = (index: number) => {
    requestAnimationFrame(() => switchTab(tabs[index].name, {}));
  };

  const onPillLayout = (event: LayoutChangeEvent) => {
    barWidth.set(event.nativeEvent.layout.width);
  };

  const openSearch = () => {
    tick();
    lensPosition.set(0);
    edgesReady.set(false);
    morphSearch(true);
    requestAnimationFrame(() => switchTab(searchTab.name, {}));
  };

  const leaveSearch = () => {
    tick();
    lensPosition.set(backIndex);
    settledIndex.set(backIndex);
    edgesReady.set(false);
    morphSearch(false);
    requestAnimationFrame(() => switchTab(tabs[backIndex].name, {}));
  };

  const closeSearch = () => {
    searchPress.press.set(1);
    searchPress.press.set(withSpring(0, motion.springs.closeFlash));
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
      const switching = index !== focused.get();
      tapStay.set(switching ? 0 : 1);
      settleOnArrival.set(false);
      tapSlide.set(1);
      tapSlide.set(withDelay(motion.tapSlide.holdDelay, withSpring(0, motion.springs.lift)));
      landing.set(switching ? withSpring(0, motion.springs.lift) : withSpring(1, motion.springs.landIn));
      barPress.set(withSpring(1, motion.springs.barPressIn));
      barGrowth.set(withSpring(motion.barGrow.held, motion.springs.barGrowIn));
      dragRelease.set(0);
      settleAt.set(-1);
      lensPresence.set(withSpring(1, motion.springs.lift));
      pressSquash.set(withSequence(withSpring(1, motion.springs.track), withSpring(0, motion.springs.edgeSettle)));
      if (switching) {
        lift.set(withSpring(1, motion.springs.lift));
      } else {
        const dipping = lift.get() > motion.tapLens.dipFrom;
        const rise = withSpring(1, motion.springs.tapLift);
        tapDipping.set(dipping);
        lift.set(dipping ? withSequence(withSpring(motion.tapLens.dip, motion.springs.tapDip), rise) : rise);
      }
      gliding.set(switching);
      glideTo.set(index);
      glideSpan.set(Math.abs(index - lensPosition.get()));
      if (switching) {
        const distance = index - lensPosition.get();
        const extra = Math.max(0, Math.abs(distance) - 1);
        lensPosition.set(
          withDelay(
            motion.switchTravel.delay,
            withSpring(index, {
              duration: motion.switchTravel.duration + motion.switchTravel.perSlot * extra,
              dampingRatio: motion.switchTravel.dampingRatio,
              velocity: Math.sign(distance) * (motion.switchTravel.kick + motion.switchTravel.kickPerSlot * extra),
            }),
          ),
        );
      } else {
        lensPosition.set(withSpring(index, motion.springs.lens));
      }
      dragOrigin.set(index);
    },
    onUpdate: (event) => {
      if (expandOnly.get()) {
        return;
      }
      if (!moved.get() && Math.abs(event.translationX) < motion.dragThreshold) {
        return;
      }
      moved.set(true);
      gliding.set(false);
      tapSlide.set(withSpring(0, motion.springs.lift));
      sliding.set(false);
      settleOnArrival.set(false);
      barPress.set(withSpring(1, motion.springs.barPressIn));
      barGrowth.set(withSpring(motion.barGrow.held, motion.springs.barGrowIn));
      const width = barWidth.get();
      const inner =
        event.x < inlinePad ? event.x - inlinePad : event.x > width - inlinePad ? event.x - (width - inlinePad) : 0;
      const rubber = Math.sign(inner) * motion.nudgeMax * (1 - 1 / (1 + Math.abs(inner) / motion.nudgeRange));
      const follow = width > 0 ? ((event.x - width / 2) / (width / 2)) * motion.nudgeFollow : 0;
      nudge.set(withSpring(rubber + follow, motion.springs.track));
      const position = positionAt(event.x);
      const lastCenter = barWidth.get() - inlinePad - fullItemWidth.get() / 2;
      const pushTarget = clamp01((event.x - lastCenter) / Math.max(fullItemWidth.get() / 2, 1));
      push.set(withSpring(pushTarget, motion.springs.track));
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
      push.set(withSpring(0, motion.springs.release));
      nudge.set(withSpring(0, motion.springs.edgeSettle));
      const settle = withSpring(0, motion.springs.release);
      const quick = !moved.get() && tapSlide.get() > 0.5;
      const tapping = quick && sliding.get();
      const pressed = !moved.get() && !quick && tapStay.get() === 1;
      const pressSwitch = !moved.get() && !quick && gliding.get();
      if (quick || pressSwitch) {
        tapSlide.set(withSpring(1, motion.springs.lift));
      }
      if (pressed) {
        tapSlide.set(1);
      }
      if (tapping) {
        settleOnArrival.set(true);
      } else if (moved.get() && index >= 0) {
        dragRelease.set(1);
        settleAt.set(index);
        landing.set(withSpring(0, motion.springs.landOut));
      } else {
        const rise = withSpring(1, motion.springs.tapRise);
        const dipping = tapDipping.get() && lift.get() > motion.tapLens.dipFrom;
        const firm = quick && !dipping && barPress.get() > motion.tapLens.firmPress;
        dripColour.set(
          firm ? withSequence(withSpring(1, motion.springs.landIn), withSpring(0, motion.springs.dripFade)) : 0,
        );
        dripShape.set(
          firm
            ? withDelay(
                motion.tapLanding.dripDelay,
                withSequence(withSpring(1, motion.springs.landIn), withSpring(0, motion.springs.landOut)),
              )
            : 0,
        );
        landing.set(
          firm
            ? withSequence(withSpring(1, motion.springs.landIn), withSpring(0, motion.springs.landOut))
            : withSpring(0, motion.springs.landOut),
        );
        lift.set(
          pressSwitch
            ? settle
            : quick || pressed
              ? dipping
              ? withSequence(withSpring(motion.tapLens.dip, motion.springs.tapDip), rise, settle)
              : withSequence(
                  rise,
                  firm
                    ? withSpring(0, motion.springs.landFall)
                    : gliding.get()
                      ? withDelay(motion.switchTravel.hold, settle)
                      : settle,
                )
            : settle,
        );
        tapDipping.set(false);
      }
      barPress.set(withSpring(0, motion.springs.barPressOut));
      barGrowth.set(withSpring(0, motion.springs.barPressOut));
      if (index >= 0) {
        if (!tapping && !(gliding.get() && index === glideTo.get())) {
          lensPosition.set(withSpring(index, motion.springs.lens));
        }
        settledIndex.set(index);
        if (committed && index !== focused.get()) {
          scheduleOnRN(selectTab, index);
        } else if (focused.get() < 0) {
          lensPresence.set(withSpring(0, motion.springs.morph));
        }
      }
    },
  });

  useFrameCallback((frame) => {
    const width = itemWidth.get();
    if (width <= 0) {
      return;
    }
    const position = lensPosition.get();
    const delta = position - previousLensPosition.get();
    if (settleAt.get() >= 0 && Math.abs(position - settleAt.get()) < motion.dragSettle.near) {
      settleAt.set(-1);
      lift.set(withSpring(0, motion.springs.release));
    }
    const direction = Math.sign(delta);
    previousLensPosition.set(position);
    const elapsed = Math.max(frame.timeSincePreviousFrame ?? 16, 1);
    const speed = (Math.abs(delta) * 1000) / elapsed;
    const dt = Math.min(elapsed, 34) / 1000;
    if (Math.abs(delta) > 0.002) {
      heading.set(Math.sign(delta));
    }
    const previousSpeed = smoothSpeed.get();
    const filteredSpeed = lift.get() > 0 ? lerp(previousSpeed, speed, 1 - Math.exp(-dt * motion.jelly.smoothing)) : 0;
    smoothSpeed.set(filteredSpeed);
    const acceleration = (filteredSpeed - previousSpeed) / dt;
    const free = 1 - slideShape.get();
    const stretchTarget = Math.min(1, filteredSpeed / motion.lensMoveSpeed) * motion.jelly.stretch * lift.get();
    const omega = (2 * Math.PI) / motion.jelly.period;
    const force =
      omega * omega * (stretchTarget - jelly.get()) -
      2 * motion.jelly.damping * omega * jellyVelocity.get() +
      motion.jelly.kick * acceleration * lift.get();
    approachSpeed.set(Math.max(approachSpeed.get() * Math.exp(-dt * motion.squish.memory), filteredSpeed));
    const endZone = gliding.get() ? motion.switchTravel.contactZone : motion.jelly.endZone;
    const nearLeft = position <= endZone && Math.abs(leftEdge.get() - leftTarget.get()) < motion.squish.contact;
    const nearRight =
      position >= lastIndex - endZone && Math.abs(rightEdge.get() - rightTarget.get()) < motion.squish.contact;
    const endReached = nearLeft || nearRight;
    if (endReached && !atEnd.get() && (lift.get() > 0.5 || sliding.get() || gliding.get())) {
      wallSide.set(nearLeft ? -1 : 1);
      squishVelocity.set(
        squishVelocity.get() +
          (gliding.get()
            ? motion.switchTravel.squishKick * glideSpan.get()
            : Math.min(approachSpeed.get(), motion.squish.speedCap) *
              motion.squish.impact *
              lerp(1, motion.tapSlide.impact, tapSlide.get())),
      );
    }
    atEnd.set(endReached);
    const squishOmega = (2 * Math.PI) / (gliding.get() ? motion.switchTravel.squishPeriod : motion.squish.period);
    const squishForce =
      -squishOmega * squishOmega * squish.get() -
      2 *
        (gliding.get() ? motion.switchTravel.squishDamping : motion.squish.damping) *
        squishOmega *
        squishVelocity.get();
    const nextSquishVelocity = squishVelocity.get() + squishForce * dt;
    squishVelocity.set(nextSquishVelocity);
    squish.set(Math.min(motion.squish.max, Math.max(-motion.squish.max, squish.get() + nextSquishVelocity * dt)));
    const nextVelocity = jellyVelocity.get() + force * dt;
    jellyVelocity.set(nextVelocity);
    jelly.set(Math.min(motion.jelly.max, Math.max(-motion.jelly.max, jelly.get() + nextVelocity * dt)));
    const speedTarget = lift.get() > 0 ? Math.min(1, speed / motion.lensMoveSpeed) : 0;
    if (Math.abs(speedTarget - movingTarget.get()) > 0.05 || (speedTarget === 0 && movingTarget.get() !== 0)) {
      movingTarget.set(speedTarget);
      moving.set(withSpring(speedTarget, motion.springs.stretch));
    }

    const reach =
      middleIndex > 0 ? (lift.get() * held.get() * motion.lensEdgeReach * (position - middleIndex)) / middleIndex : 0;
    const center =
      barWidth.get() / 2 +
      pillShiftX.get() +
      (position - middleIndex) * width +
      reach +
      push.get() * motion.lensPushTravel;
    const restHalf = Math.min(layout.bubbleRestWidth, width + space[6]) / 2;
    const spread = Math.max(
      lift.get(),
      Math.min(1, landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.hold),
    );
    const halfWidth =
      lerp(restHalf, (width / 2) * motion.lensLift.x, spread * free) *
      lerp(1, motion.switchTravel.wide, gliding.get() ? lift.get() : 0);
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

    if (sliding.get()) {
      const travel = slideTo.get() - slideFrom.get();
      const lead = slideRight.get() ? rightEdge.get() : leftEdge.get();
      const arrived = Math.abs(travel) > 0.5 ? (lead - slideFrom.get()) / travel : 1;
      if (settleOnArrival.get() && arrived >= motion.tapSlide.arrival) {
        settleOnArrival.set(false);
        lift.set(withSpring(0, motion.springs.tapSettle));
      }
      const resting =
        lift.get() < 0.001 &&
        Math.abs(leftEdge.get() - leftTarget.get()) < motion.edgeEpsilon &&
        Math.abs(rightEdge.get() - rightTarget.get()) < motion.edgeEpsilon &&
        Math.abs(position - Math.round(position)) < 0.002;
      if (tapSlide.get() > 0.5 && !resting) {
        return;
      }
      sliding.set(false);
    }

    if (gliding.get() && lift.get() < 0.001 && Math.abs(position - glideTo.get()) < 0.002) {
      gliding.set(false);
    }
    if (gliding.get() || (tapStay.get() === 1 && !moved.get() && held.get() < 0.5)) {
      leftTarget.set(left);
      rightTarget.set(right);
      leftEdge.set(left);
      rightEdge.set(right);
      return;
    }

    const settling = direction === 0;
    if (Math.abs(left - leftTarget.get()) > motion.edgeEpsilon) {
      leftTarget.set(left);
      const config = settling
        ? motion.springs.jellySettle
        : direction < 0
          ? motion.springs.jellyLead
          : motion.springs.jellyTrail;
      leftEdge.set(withSpring(left, config));
    }
    if (Math.abs(right - rightTarget.get()) > motion.edgeEpsilon) {
      rightTarget.set(right);
      const config = settling
        ? motion.springs.jellySettle
        : direction > 0
          ? motion.springs.jellyLead
          : motion.springs.jellyTrail;
      rightEdge.set(withSpring(right, config));
    }
  });

  const deflate = useDerivedValue(() => {
    const travel = clamp01(
      (Math.abs(lensPosition.get() - dragOrigin.get()) - motion.deflateTravel) / motion.deflateRamp,
    );
    const fast = clamp01((moving.get() - motion.deflateSpeed) / (1 - motion.deflateSpeed));
    return fast * travel * lift.get();
  });

  const lensGeometry = useDerivedValue(() => {
    const fullWidth = layout.bubbleRestWidth;
    const left = leftEdge.get();
    const right = rightEdge.get();
    const span = Math.max(0, right - left);
    const barScale = fullHeight / lensFullHeight;
    const slide = slideShape.get();
    const liftScale = lerp(
      lerp(
        layout.bubbleRestHeight / lensFullHeight,
        lerp(
          lerp(
            motion.lensLift.y,
            lerp(moved.get() ? motion.lensLift.y : motion.tapLens.holdLiftY, motion.tapLens.liftY, tapSlide.get()),
            tapStay.get(),
          ),
          (fullHeight * motion.switchTravel.height) / lensFullHeight,
          tapSlide.get() * (1 - tapStay.get()),
        ),
        lift.get(),
      ),
      barScale,
      deflate.get(),
    );
    const minScaleY = lerp(layout.bubbleRestHeight / lensFullHeight, barScale, lift.get()) * (1 - slide);
    const rest = restSpan.get();
    const stretchRatio = rest > 0 ? span / rest : 1;
    const floor = lerp(motion.minLensSquash, motion.tapSlide.minSquash, slide);
    const travel = slideTo.get() - slideFrom.get();
    const lead = slideRight.get() ? right : left;
    const arrived = Math.abs(travel) > 0.5 ? clamp01((lead - slideFrom.get()) / travel) : 1;
    const thinning = lerp(0.5, arrived * arrived, slide);
    const squash = Math.min(1 / floor, Math.max(floor, Math.pow(Math.max(stretchRatio, 0.01), -thinning)));
    const compact = lerp(1, lensCompactScaleY, collapsed.get());
    const base = compact * Math.max(minScaleY, liftScale * squash * (1 - pressSquash.get() * motion.pressSquashY));
    let scaleY =
      base *
      (1 - jelly.get() * motion.jelly.thin * lerp(1, motion.tapSlide.jellyY, slide)) *
      (1 + squish.get() * (gliding.get() ? motion.switchTravel.squishBulge : motion.squish.bulge));
    let scaleX =
      (fullWidth > 0 ? Math.max(span / fullWidth, 0.01) : 1) *
      (1 + pressSquash.get() * motion.pressSquashX) *
      (1 + jelly.get() * lerp(1, motion.tapSlide.jellyX, slide)) *
      (1 - squish.get());
    const wall = Math.max(base, (compact * (fullHeight + motion.canal.overflow)) / lensFullHeight);
    if (scaleY > wall) {
      const excess = scaleY - wall;
      scaleY = wall + excess * motion.canal.give;
      scaleX +=
        excess *
        (1 - motion.canal.give) *
        lerp(motion.canal.spread, motion.tapSlide.wallSpread, slide) *
        (lensFullHeight / fullWidth);
    }
    if (gliding.get()) {
      const knee = (fullHeight * motion.switchTravel.height) / lensFullHeight;
      const cap = (fullHeight - 2 * motion.switchTravel.railGap) / lensFullHeight;
      if (scaleY > knee && cap > knee) {
        const room = cap - knee;
        const capped = knee + room * Math.tanh((scaleY - knee) / room);
        scaleX += (scaleY - capped) * motion.switchTravel.heightToWidth * (lensFullHeight / fullWidth);
        scaleY = capped;
      }
    }
    const land = landing.get() * tapStay.get() * tapSlide.get();
    scaleX *= 1 + land * motion.tapLanding.wide;
    scaleY *= 1 - land * motion.tapLanding.flat;
    return {
      translateX:
        (left + right) / 2 -
        inlinePad -
        fullWidth / 2 +
        heading.get() * Math.abs(jelly.get()) * (span / 2) * motion.jelly.lean +
        wallSide.get() * squish.get() * (span / 2),
      translateY:
        slide * lift.get() * motion.tapSlide.drop + land * (1 - lift.get()) * motion.tapLanding.drop,
      scaleX,
      scaleY,
    };
  });

  const lensRise = useDerivedValue(() => {
    const overhang = (lensGeometry.get().scaleY * lensFullHeight - fullHeight) / 2;
    const out = clamp01(overhang / motion.tapLens.revealOverhang);
    return lerp(out * out * (3 - 2 * out), 1, held.get());
  });
  const lensPeak = useSharedValue(0);
  useAnimatedReaction(
    () =>
      lift.get() < motion.tapLens.fallGrey.from && landing.get() < motion.tapLens.fallGrey.from
        ? 0
        : Math.max(lensPeak.get(), lensRise.get()),
    (peak) => {
      if (peak !== lensPeak.get()) {
        lensPeak.set(peak);
      }
    },
  );
  const lensOut = useDerivedValue(() => {
    const { from, to } = motion.tapLens.fallGrey;
    const fall = clamp01((lift.get() - from) / (to - from));
    const land = landing.get() * tapStay.get() * tapSlide.get();
    return Math.max(lensRise.get(), Math.min(lensPeak.get(), Math.max(fall * fall * (3 - 2 * fall), land)));
  });
  const grey = useDerivedValue(() =>
    Math.max(
      lerp(1 - shine.get(), 1 - lensOut.get(), tapStay.get()),
      landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.tint,
    ),
  );

  const lensStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      opacity: edgesReady.get()
        ? lensPresence.get() * grey.get() * (1 - clamp01(collapsed.get() * motion.labelFadeRate))
        : 0,
      transform: [
        { translateX: geometry.translateX },
        { translateY: geometry.translateY },
        { scaleX: geometry.scaleX },
        { scaleY: geometry.scaleY },
      ],
    };
  });

  const lensGlassOpacity = useDerivedValue(() =>
    edgesReady.get()
      ? Math.max(
          lerp(lift.get(), clamp01(lift.get() * motion.tapSlide.glassRamp), Math.max(tapSlide.get(), dragRelease.get())),
          clamp01(landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.glassHold),
        )
      : 0,
  );

  const lensGlassStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      opacity: lensGlassOpacity.get(),
      transform: [
        { translateX: geometry.translateX },
        { translateY: geometry.translateY },
        { scaleX: geometry.scaleX },
        { scaleY: geometry.scaleY },
      ],
    };
  });

  const lensIconStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      opacity: Math.max(
        lensGlassOpacity.get(),
        (gliding.get() || dragRelease.get() > 0) && lift.get() > 0 ? 1 : 0,
        clamp01(
          landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.glassHold * motion.tapLanding.iconHold,
        ),
      ),
      transform: [
        { translateX: geometry.translateX },
        { translateY: geometry.translateY },
        { scaleX: geometry.scaleX },
        { scaleY: geometry.scaleY },
      ],
    };
  });

  const searchScale = useDerivedValue(
    () =>
      scaleY.get() *
      lerp(1, modeShrink, Math.pow(clamp01(searchMode.get()), motion.searchMorph.heightLag)) *
      (1 + searchPress.press.get() * motion.pressGrow),
  );
  const searchFillStyle = useAnimatedStyle(() => {
    const mode = searchMode.get();
    const travel = barWidth.get() + layout.tabBarGap + fullHeight / 2 - fieldGlyphCenter;
    if (modeTarget.get() === 0) {
      return {
        opacity:
          searchPress.press.get() *
          (mode < motion.backTravel.handoff
            ? 1
            : clamp01((mode - motion.searchClose.fadeFrom) / (1 - motion.searchClose.fadeFrom))),
        transform: [
          {
            translateX:
              (-motion.searchPop.shift * (1 - clamp01(searchPop.get())) * clamp01(mode)) /
              Math.max(searchScale.get(), 0.01),
          },
        ],
      };
    }
    return {
      opacity:
        searchPress.press.get() *
        (mode < 0.5 ? 1 - clamp01(mode * motion.searchTabs.pressFade) : clamp01((searchPop.get() - 0.75) * 4)),
      transform: [{ translateX: mode < 0.5 ? -travel * clamp01(mode) : 0 }],
    };
  });
  const searchInkStyle = useAnimatedStyle(() => ({
    opacity: 1 - searchPress.press.get() * iconDim,
  }));

  const barLiftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Math.min(0, keyboardHeight.get() + bottom - space[8]) * clamp01(searchMode.get()),
      },
    ],
  }));

  const pillModeStyle = useAnimatedStyle(() => ({
    opacity:
      1 - clamp01(searchMode.get() * (modeTarget.get() === 1 ? motion.searchTabs.fade : motion.searchTabs.closeFade)),
  }));
  const searchCenter = useDerivedValue(() => barWidth.get() + layout.tabBarGap + fullHeight / 2);
  const pillReach = useDerivedValue(() =>
    modeTarget.get() === 1 ? lerp(barWidth.get(), modeInset + modeHeight, clamp01(searchMode.get())) : barWidth.get(),
  );
  const rowFit = useDerivedValue(() => {
    if (modeTarget.get() === 1) {
      return { scale: 1, x: 0, y: 0 };
    }
    const settled = clamp01(searchMode.get());
    const width = Math.max(barWidth.get(), 1);
    return {
      scale: lerp(width, modeHeight, settled) / width,
      x: modeInset * settled,
      y: modeInset * Math.pow(settled, motion.searchMorph.heightLag),
    };
  });
  const rowClipStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillReach.get() - barWidth.get() }],
  }));
  const rowUnclipStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: barWidth.get() - pillReach.get() }],
  }));
  const rowFitStyle = useAnimatedStyle(() => {
    const fit = rowFit.get();
    const width = Math.max(barWidth.get(), 1);
    return {
      transform: [
        { translateX: fit.x - (width * (1 - fit.scale)) / 2 },
        { translateY: fit.y - (fullHeight * (1 - fit.scale)) / 2 },
        { scale: fit.scale },
      ],
    };
  });
  const rowBlurProps = useAnimatedProps(() => ({
    radius: clamp01(searchMode.get()) * motion.searchTabs.blur,
  }));
  const searchContentStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: searchScale.get() },
    ],
  }));

  const barGlassProps = useAnimatedProps(() => {
    const width = barWidth.get();
    if (width <= 0) {
      return {
        shapes: [] as number[],
        blend: 0,
        dim: 0,
        glowX: 0,
        glowY: 0,
        glowSpread: 0,
        glowStrength: 0,
        frost: 0,
        frostClear: 0,
        frostRadius: 0,
        frostLeft: 0,
        frostTop: 0,
        frostRight: 0,
        frostBottom: 0,
      };
    }
    const mode = searchMode.get();
    const settled = clamp01(mode);
    const settledY = Math.pow(settled, motion.searchMorph.heightLag);
    const pop = searchPop.get();
    const popPlace = clamp01(pop);
    const pad = glass.pad;

    const growX = barGrowth.get() * motion.barGrow.x * (1 - settled);
    const grow = barGrowth.get() * motion.barGrow.y * (1 - settled);
    const wallBulge = Math.max(0, squish.get()) * motion.squish.barBulge * (1 - settled);
    const pillLeft =
      pillShiftX.get() + (width - width * scaleX.get()) / 2 - growX - (wallSide.get() < 0 ? wallBulge : 0);
    const pillRight =
      pillLeft +
      width * scaleX.get() +
      growX * (1 + motion.barGrow.towardSearch) +
      (wallSide.get() < 0 ? wallBulge : 0) +
      (wallSide.get() > 0 ? wallBulge : 0);
    const pillInset = (fullHeight * (1 - scaleY.get())) / 2;
    const pillTop = pillInset - grow;
    const backGrow = modeRadius * motion.pressGrow * backPress.press.get() * settled;
    const backLeft = lerp(pillLeft, pillLeft + modeInset, settled) - backGrow;
    const bump = searchBump.get();
    const backRight =
      lerp(pillRight, pillLeft + modeInset + modeHeight, settled) +
      backGrow +
      bump * motion.searchBump.overshoot -
      backBump.get() * motion.searchBump.squish;
    const backTop = lerp(pillTop, modeInset, settledY) - backGrow;
    const backBottom = lerp(fullHeight - pillInset + grow, fullHeight - modeInset, settledY) + backGrow;

    const searchX = width + layout.tabBarGap + fullHeight / 2;
    const circleY = fullHeight / 2;
    const searchRadius = (fullHeight / 2) * searchScale.get();
    const fieldEnd = searchX + searchRadius - motion.searchPop.shift * settled;
    const circleX = lerp(searchX, lerp(searchX - motion.searchPop.shift, searchX, popPlace), settled);
    const circleRadius = lerp(
      searchRadius,
      lerp(searchRadius * motion.searchPop.hiddenScale, searchRadius, pop),
      settled,
    );

    const fieldLeft = lerp(searchX - searchRadius, pillLeft + modeInset + modeHeight + layout.searchModeGap, settled);
    const fieldRight = lerp(fieldEnd, searchX - modeRadius - layout.searchModeGap, popPlace);
    const fieldTop = lerp(circleY - searchRadius, modeInset, settledY);
    const fieldBottom = lerp(circleY + searchRadius, fullHeight - modeInset, settledY);
    const tucked =
      settled > 0 ? Math.min(circleRadius, ((fieldBottom - fieldTop) / 2) * motion.searchPop.tuckScale) : circleRadius;
    const fieldRadius = lerp(tucked, circleRadius, popPlace);

    return {
      blend: Math.max(
        glass.blend * clamp01(mode * 3),
        glass.popBlend * Math.sin(Math.PI * popPlace) * settled,
        glass.liftBlend *
          lift.get() *
          (1 - settled) *
          (1 -
            clamp01(1 - (lastIndex - lensPosition.get()) / glass.lensPinchSideReach) *
              (1 - lerp(motion.endMelt, 1, push.get()))),
        glass.pressBlend * searchPress.press.get(),
        glass.meltBlend *
          shine.get() *
          (1 - settled) *
          clamp01(1 - (lastIndex - lensPosition.get()) / glass.lensPinchSideReach) *
          lerp(motion.endMelt, 1, push.get()),
      ),
      dim: 0,
      frost:
        glass.lensFrost * lensPresence.get() * grey.get() * (1 - clamp01(collapsed.get() * motion.labelFadeRate)),
      frostClear: glass.lensFrostClear,
      frostRadius: glass.lensFrostRadius,
      frostLeft: leftEdge.get() + pad,
      frostRight: rightEdge.get() + pad,
      frostTop: fullHeight / 2 + lensGeometry.get().translateY - (lensFullHeight * lensGeometry.get().scaleY) / 2 + pad,
      frostBottom: fullHeight / 2 + lensGeometry.get().translateY + (lensFullHeight * lensGeometry.get().scaleY) / 2 + pad,
      glowX: (leftEdge.get() + rightEdge.get()) / 2 + pad,
      glowY: fullHeight / 2 + pad,
      glowSpread: glass.pressGlowSpread,
      glowStrength: glass.pressGlow * shine.get() * barPress.get() * (1 - settled),
      shapes: [
        backLeft + pad,
        backTop + pad,
        backRight + pad,
        backBottom + pad,
        circleX - fieldRadius + bump * motion.searchBump.squish + pad,
        circleY - fieldRadius + pad,
        circleX + fieldRadius + pad,
        circleY + fieldRadius + pad,
        ...(mode > 0
          ? [fieldLeft + bump * motion.searchBump.squish + pad, fieldTop + pad, fieldRight + pad, fieldBottom + pad]
          : []),
      ],
    };
  });
  const searchGlyphStyle = useAnimatedStyle(() => ({
    opacity: searchMode.get() > motion.backTravel.handoff ? 0 : 1,
  }));
  const closeGlyphStyle = useAnimatedStyle(() => {
    const settled = clamp01(searchMode.get());
    const pop = clamp01(searchPop.get());
    return {
      opacity:
        modeTarget.get() === 1
          ? clamp01(searchMode.get() * 2 - 1)
          : clamp01((searchMode.get() - motion.searchClose.fadeFrom) / (1 - motion.searchClose.fadeFrom)),
      transform: [
        { translateX: (-motion.searchPop.shift * (1 - pop) * settled) / Math.max(searchScale.get(), 0.01) },
        { scale: lerp(motion.searchPop.glyphScale / (1 + searchPress.press.get() * motion.pressGrow), 1, pop) },
      ],
    };
  });

  const pressScaleStyle = useAnimatedStyle(() => {
    const width = Math.max(barWidth.get(), 1);
    const growX = barGrowth.get() * motion.barGrow.x * (1 - clamp01(searchMode.get()));
    return {
      transform: [
        { translateX: (-growX * (1 - motion.barGrow.towardSearch)) / 2 },
        { scale: 1 + (growX * (1 + motion.barGrow.towardSearch)) / width },
      ],
    };
  });

  const pillLiftStyle = useAnimatedStyle(() => {
    const width = Math.max(barWidth.get(), 1);
    const open = 1 - clamp01(searchMode.get());
    const growX = barGrowth.get() * motion.barGrow.x * open;
    const growY = barGrowth.get() * motion.barGrow.y * open;
    return {
      opacity: shine.get() * lerp(1, barPress.get(), tapStay.get()) * open,
      transform: [
        { translateX: (growX * (motion.barGrow.towardSearch - 1)) / 2 },
        { scaleX: 1 + (growX * (1 + motion.barGrow.towardSearch)) / width },
        { scaleY: 1 + (growY * 2) / fullHeight },
      ],
    };
  });

  const glide = useDerivedValue(() => (gliding.get() ? 1 : 0));
  const dragColour = useDerivedValue(() => (moved.get() ? motion.dragSettle.colour : 1));

  const switchOptics = useDerivedValue(() => {
    const fade = clamp01((lift.get() - motion.switchTravel.clearFrom) / (1 - motion.switchTravel.clearFrom));
    return gliding.get() ? motion.switchTravel.optics * fade * fade * (3 - 2 * fade) : 1;
  });

  const wallFlat = useDerivedValue(() => {
    const press = clamp01(Math.abs(squish.get()) * motion.squish.flatRate);
    const flat = press * press;
    return {
      side: flat > 0.001 ? -wallSide.get() : 0,
      round: lerp(1, motion.squish.flatRound, flat),
      lead: lerp(1, motion.squish.leadRound, flat),
    };
  });

  const lensOptics = useDerivedValue(() => {
    const geometry = lensGeometry.get();
    const slide = slideShape.get();
    const canal = slide * lift.get();
    const optics = lerp(1, clamp01(lift.get() * motion.tapSlide.glassRamp), slide);
    const travel = switchOptics.get();
    const bendScale = optics * lerp(1, motion.tapSlide.bend, slide) * travel;
    const centerX = inlinePad + layout.bubbleRestWidth / 2 + geometry.translateX;
    const centerY = fullHeight / 2 + geometry.translateY;
    const reveal = lensOut.get();
    return {
      refraction: glass.lensRefraction * bendScale * reveal,
      magnify: glass.lensMagnify * optics * travel * reveal,
      dispersion: glass.lensDispersion * bendScale * reveal,
      ellipse: Math.max(canal, motion.tapLens.ellipse * lift.get() * (1 - held.get())),
      clipLeft: -motion.canal.overflow - centerX,
      clipTop: -motion.canal.overflow - centerY,
      clipRight: barWidth.get() + motion.canal.overflow - centerX,
      clipBottom: fullHeight + motion.canal.overflow - centerY,
      clipScaleX: Math.max(geometry.scaleX, 0.01),
      clipScaleY: Math.max(geometry.scaleY, 0.01),
      clipSoft: motion.canal.soft,
      clipOn: canal,
      wallSide: wallFlat.get().side,
      wallRound: wallFlat.get().round,
      wallLead: wallFlat.get().lead,
    };
  });

  const lensIconProps = useAnimatedProps(() => {
    const optics = lensOptics.get();
    return {
      ...optics,
      refraction: optics.refraction * glass.lensIconBend,
      topBend: lerp(1, motion.tapLanding.iconBend, dripShape.get()),
      topDepth: lerp(1, motion.tapLanding.iconDepth, dripShape.get() * dripShape.get()),
      dispersion:
        optics.dispersion *
        lerp(1, motion.tapLanding.iconSpread, clamp01(landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.hold)) *
        lerp(motion.switchTravel.colour, 1, tapStay.get()) *
        lerp(1, glass.lensGlideColour[scheme], glide.get()) *
        dragColour.get(),
      rimPrism:
        glass.lensIconPrism *
        lensOut.get() *
        lerp(1, dripColour.get(), clamp01(landing.get() * tapStay.get() * tapSlide.get() * motion.tapLanding.hold)) *
        lerp(motion.switchTravel.colour, 1, tapStay.get()) *
        lerp(1, glass.lensGlideColour[scheme], glide.get()) *
        dragColour.get(),
    };
  });

  const lensSideProps = useAnimatedProps(() => {
    const position = lensPosition.get();
    const geometry = lensGeometry.get();
    const restWidth = layout.bubbleRestWidth;
    const lensCenter = inlinePad + restWidth / 2 + geometry.translateX;
    const gapMiddle = lerp(
      barWidth.get() + layout.tabBarGap / 2,
      barWidth.get() + layout.tabBarGap + motion.meltReach,
      lerp(motion.endMelt, 1, push.get()),
    );
    const sampleMaxX = (gapMiddle - lensCenter) / Math.max(geometry.scaleX, 0.01) + restWidth / 2 + glass.lensPad;
    const pinchScale =
      lerp(1, motion.tapSlide.pinch, slideShape.get()) *
      switchOptics.get() *
      lerp(1, glass.lensGlidePinch[scheme], glide.get());
    const reveal = lensOut.get();
    const optics = lensOptics.get();
    const glideColour = lerp(1, glass.lensGlideColour[scheme], glide.get());
    const tint = interpolateColor(reveal, [0, 1], [color.chrome.lensTintEarly, color.chrome.lensTint]);
    return {
      ...optics,
      dispersion: optics.dispersion * glideColour,
      edgeSharp: lerp(glass.lensEdgeShade[scheme], glass.lensGlideEdge[scheme], glide.get()),
      sampleMaxX: Math.max(sampleMaxX, 1),
      pinch: glass.lensPinch * (1 - deflate.get()) * pinchScale * reveal,
      pinchLeft: glass.lensPinch * clamp01(1 - position / glass.lensPinchSideReach) * pinchScale * reveal,
      pinchRight:
        glass.lensPinch * clamp01(1 - (lastIndex - position) / glass.lensPinchSideReach) * pinchScale * reveal,
      specular: glass.lensSpecular * reveal,
      rim: interpolateColor(
        reveal,
        [0, 1],
        [color.chrome.lensRimEarly, glide.get() ? color.chrome.lensGlideRim : color.chrome.lensRim],
      ),
      rimPrism: glass.lensRimPrism[scheme] * reveal * glideColour * dragColour.get(),
      shadow: interpolateColor(reveal, [0, 1], [color.chrome.lensTintEarly, color.chrome.lensShadow]),
      tint: glide.get()
        ? interpolateColor(reveal, [0, 1], [color.chrome.lensTintEarly, color.chrome.lensGlideTint])
        : tint,
    };
  });

  const lensFillStyle = useAnimatedStyle(() => {
    const { side, round, lead } = wallFlat.get();
    const full = lensFullHeight / 2;
    const left = full * (side < 0 ? round : side > 0 ? lead : 1);
    const right = full * (side > 0 ? round : side < 0 ? lead : 1);
    return {
      backgroundColor: interpolateColor(1 - grey.get(), [0, 1], [color.chrome.lens, color.chrome.lensActive]),
      borderTopLeftRadius: left,
      borderBottomLeftRadius: left,
      borderTopRightRadius: right,
      borderBottomRightRadius: right,
    };
  });

  return (
    <Animated.View
      style={[styles.bar, { bottom, left: barLeft, width: barSpan }, barLiftStyle]}
      pointerEvents="box-none">
      <NativeGlassBackdrop group={tabBarGroup} style={styles.backdrop}>
        <AnimatedNativeGlassView
          style={styles.barGlass}
          pointerEvents="none"
          animatedProps={barGlassProps}
          {...glassStyle}
          sampleBackdrop
          onBackdropLuma={onBackdropLuma}
        />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.frame, pillModeStyle]}
            pointerEvents={searchFocused ? 'none' : 'auto'}
            onLayout={onPillLayout}>
            <Animated.View
              pointerEvents="none"
              style={[styles.pillLift, { backgroundColor: color.chrome.pressLift }, pillLiftStyle]}
            />
            <Animated.View pointerEvents="none" style={[styles.lens, lensStyle]}>
              <Animated.View style={[styles.lensLayer, lensFillStyle]} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
        <Animated.View style={styles.search}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={searchFocused ? closeSearch : openSearch}
            onPressIn={searchPress.onPressIn}
            onPressOut={searchPress.onPressOut}
            accessibilityRole="tab"
            accessibilityLabel={searchFocused ? 'Close search' : searchTab.label}
            accessibilityState={{ selected: searchFocused }}>
            <Animated.View style={[StyleSheet.absoluteFill, searchContentStyle]}>
              <Animated.View style={[styles.pressFill, { backgroundColor: color.chrome.pressFill }, searchFillStyle]} />
              <Animated.View style={[styles.searchIcon, searchInkStyle]}>
                <Animated.View style={[styles.searchIcon, searchGlyphStyle]}>
                  <Icon name={searchTab.icon} size={layout.searchIconSize} label={searchTab.label} />
                </Animated.View>
                <Animated.View style={[styles.searchIcon, closeGlyphStyle]}>
                  <Icon name="close" size={layout.closeIconSize} weight="light" />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </NativeGlassBackdrop>
      <Animated.View pointerEvents="none" style={[styles.lensOverlay, pillModeStyle, pressScaleStyle]}>
        <Animated.View style={[styles.rowClip, rowClipStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, rowUnclipStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, rowFitStyle]}>
              <AnimatedNativeGlassBlur style={styles.row} animatedProps={rowBlurProps} accessibilityRole="tablist">
                {tabs.map((tab, index) => (
                  <TabItem
                    key={tab.name}
                    tab={tab}
                    index={index}
                    selected={index === focusedIndex}
                    lensPosition={lensPosition}
                    lift={lift}
                    shine={shine}
                    presence={lensPresence}
                    collapsed={collapsed}
                    collapseX={collapseX}
                    collapseSpread={collapseSpread}
                    activeInk={activeInk}
                    handoff={index === backIndex ? searchMode : undefined}
                    onActivate={selectTab}
                  />
                ))}
              </AnimatedNativeGlassBlur>
            </Animated.View>
          </Animated.View>
        </Animated.View>
        <NativeGlassBackdrop
          group={revealGroup}
          offscreen
          style={StyleSheet.absoluteFill}
          importantForAccessibility="no-hide-descendants">
          <View style={styles.row}>
            {tabs.map((tab, index) => (
              <TabItem
                key={tab.name}
                tab={tab}
                index={index}
                selected={index === focusedIndex}
                lensPosition={lensPosition}
                lift={lift}
                shine={shine}
                presence={lensPresence}
                collapsed={collapsed}
                collapseX={collapseX}
                collapseSpread={collapseSpread}
                activeInk={activeInk}
                revealed
                onActivate={selectTab}
              />
            ))}
          </View>
        </NativeGlassBackdrop>
        <Animated.View style={[styles.lens, lensGlassStyle]}>
          <AnimatedNativeGlassView
            style={styles.lensGlass}
            animatedProps={lensSideProps}
            group={tabBarGroup}
            underlay={screenGroup}
            inset={glass.lensPad}
            plain={forcePlainGlass}
            refractionYScale={glass.lensRefractionYScale}
            cornerRadius={lensFullHeight / 2}
            blurRadius={glass.lensBlurRadius}
            bezel={glass.lensBezel}
            refraction={glass.lensRefraction}
            falloff={glass.lensFalloff}
            dispersion={glass.lensDispersion}
            magnify={glass.lensMagnify}
            pinchWidth={glass.lensPinchWidth}
            pinchSpread={glass.lensPinchSpread}
            sharpWidth={glass.lensShadeWidth}
            lightAngle={glass.lightAngle}
            rimSide={glass.lensRimSide[scheme]}
            rimWidth={glass.lensRimWidth[scheme]}
            shadowRadius={glass.lensShadowRadius}
            shadowOffset={glass.lensShadowOffset}
          />
        </Animated.View>
        <Animated.View style={[styles.lens, lensIconStyle]}>
          <AnimatedNativeGlassView
            style={styles.lensGlass}
            animatedProps={lensIconProps}
            group={revealGroup}
            alphaPass
            inset={glass.lensPad}
            plain={forcePlainGlass}
            refractionYScale={glass.lensRefractionYScale}
            cornerRadius={lensFullHeight / 2}
            blurRadius={glass.lensBlurRadius}
            bezel={glass.lensBezel}
            refraction={glass.lensRefraction}
            falloff={glass.lensFalloff}
            dispersion={glass.lensDispersion}
            magnify={glass.lensMagnify}
          />
        </Animated.View>
      </Animated.View>
      <SearchMode
        active={searchFocused}
        mode={searchMode}
        backTab={tabs[backIndex]}
        backPress={backPress}
        travel={{
          index: backIndex,
          slotWidth: fullItemWidth,
          circle: searchCenter,
          press: searchPress.press,
          target: modeTarget,
          fit: rowFit,
        }}
        onBack={leaveSearch}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
  },
  backdrop: {
    flexDirection: 'row',
    gap: layout.tabBarGap,
  },
  rowClip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: fullHeight / 2,
  },
  lensOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: fullHeight + layout.tabBarGap,
    height: fullHeight,
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
  pressFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: fullHeight / 2,
  },
  pillLift: {
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
    left: inlinePad,
    width: layout.bubbleRestWidth,
    height: lensFullHeight,
  },
  lensGlass: {
    position: 'absolute',
    top: -glass.lensPad,
    left: -glass.lensPad,
    right: -glass.lensPad,
    bottom: -glass.lensPad,
  },
  lensLayer: {
    ...StyleSheet.absoluteFill,
    borderRadius: lensFullHeight / 2,
    overflow: 'hidden',
  },
  row: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    paddingVertical: rowInset,
    paddingHorizontal: inlinePad,
  },
  slot: {
    flex: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBox: {
    alignSelf: 'stretch',
    height: layout.tabLabelHeight,
  },
  label: {
    fontSize: layout.tabLabelSize,
    fontWeight: '500',
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
