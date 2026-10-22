import { AndroidHaptics, performAndroidHapticsAsync } from 'expo-haptics';
import { useTabTrigger } from 'expo-router/ui';
import { useEffect, useState } from 'react';
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

import { AnimatedNativeGlassView, NativeGlassBackdrop } from '@/components/glass/NativeGlass';
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
const compactScaleY = layout.tabBarCompactHeight / fullHeight;
const lensFullHeight = fullHeight - rowInset * 2;
const lensCompactScaleY = (layout.tabBarCompactHeight - rowInset * 2) / lensFullHeight;
const labelShift = layout.tabLabelHeight / 2;
const modeHeight = layout.searchModeHeight;
const modeInset = (fullHeight - modeHeight) / 2;
const modeRadius = modeHeight / 2;
const modeShrink = modeHeight / fullHeight;
const tabBarGroup = 'tabbar';
const screenGroup = 'default';
const revealGroup = 'tabbar-reveal';

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
  shine: SharedValue<number>;
  presence: SharedValue<number>;
  collapsed: SharedValue<number>;
  itemShift: SharedValue<number>;
  barShiftX: SharedValue<number>;
  barShiftY: SharedValue<number>;
  revealed?: boolean;
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
  itemShift,
  barShiftX,
  barShiftY,
  revealed = false,
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
    transform: [
      { translateX: barShiftX.get() + (index - middleIndex) * itemShift.get() },
      { translateY: barShiftY.get() + collapsed.get() * labelShift },
      { scale: 1 + lift.get() * proximity.get() * motion.itemMagnify },
    ],
  }));
  const highlight = useDerivedValue(() => (revealed ? 1 : chosen.get() * presence.get() * (1 - lift.get())));
  const activeStyle = useAnimatedStyle(() => ({ opacity: highlight.get() }));
  const glow = useDerivedValue(() => (revealed ? shine.get() : 0));
  const activeRestStyle = useAnimatedStyle(() => ({
    opacity: highlight.get() * (1 - glow.get()),
  }));
  const activeLiftStyle = useAnimatedStyle(() => ({
    opacity: highlight.get() * glow.get(),
  }));
  const idleStyle = useAnimatedStyle(() => ({ opacity: 1 - highlight.get() }));
  const activeLabelColor = useAnimatedStyle(() => ({
    color: interpolateColor(glow.get(), [0, 1], [color.accent.default, color.chrome.tabAccent]),
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
        <View>
          <Animated.View style={idleStyle}>
            <Icon name={tab.icon} size={layout.tabIconSize} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeRestStyle]}>
            <Icon name={tab.icon} variant="fill" size={layout.tabIconSize} tone="accent" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, activeLiftStyle]}>
            <Icon name={tab.icon} variant="fill" size={layout.tabIconSize} color={color.chrome.tabAccent} />
          </Animated.View>
        </View>
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
  const tapSlide = useSharedValue(0);
  const slideTrail = useSharedValue(0);
  const sliding = useSharedValue(false);
  const slideFrom = useSharedValue(0);
  const slideTo = useSharedValue(0);
  const slideRight = useSharedValue(true);
  const shine = useDerivedValue(() => lift.get() * (1 - tapSlide.get()));
  const squishVelocity = useSharedValue(0);
  const wallSide = useSharedValue(0);
  const approachSpeed = useSharedValue(0);
  const movingTarget = useSharedValue(0);

  const scaleX = useDerivedValue(() => lerp(1, layout.tabBarCompactWidthRatio, collapsed.get()));
  const scaleY = useDerivedValue(() => lerp(1, compactScaleY, collapsed.get()));
  const fullItemWidth = useDerivedValue(() => (barWidth.get() - inlinePad * 2) / tabCount);
  const itemWidth = useDerivedValue(() => (barWidth.get() * scaleX.get() - inlinePad * 2) / tabCount);
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
  }, [searchFocused, searchMode]);

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
      const switching = index !== focused.get();
      tapSlide.set(switching ? 1 : 0);
      lensPresence.set(withSpring(1, motion.springs.lift));
      pressSquash.set(withSequence(withSpring(1, motion.springs.track), withSpring(0, motion.springs.edgeSettle)));
      lift.set(withSpring(1, motion.springs.lift));
      if (!switching) {
        barPress.set(withSpring(1, motion.springs.barPressIn));
      }
      if (switching) {
        const extra = Math.max(0, Math.abs(index - focused.get()) - 1);
        const reach = lastIndex > 1 ? extra / (lastIndex - 1) : 1;
        const lead = {
          duration: motion.tapSlide.lead + motion.tapSlide.leadPerSlot * extra,
          dampingRatio: lerp(motion.tapSlide.leadDamping, motion.tapSlide.farDamping, reach),
        };
        const trail = {
          duration: motion.tapSlide.trail + motion.tapSlide.trailPerSlot * extra,
          dampingRatio: 1,
        };
        slideTrail.set(trail.duration);
        sliding.set(true);
        const width = itemWidth.get();
        const center = barWidth.get() / 2 + pillShiftX.get() + (index - middleIndex) * width;
        const half = Math.min(layout.bubbleRestWidth, width + space[6]) / 2;
        const rightward = index > focused.get();
        slideRight.set(rightward);
        slideFrom.set(rightward ? rightEdge.get() : leftEdge.get());
        slideTo.set(rightward ? center + half : center - half);
        leftTarget.set(center - half);
        rightTarget.set(center + half);
        leftEdge.set(withSpring(center - half, rightward ? trail : lead));
        rightEdge.set(withSpring(center + half, rightward ? lead : trail));
        jelly.set(0);
        jellyVelocity.set(0);
        lensPosition.set(withSpring(index, lead));
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
      tapSlide.set(withSpring(0, motion.springs.lift));
      sliding.set(false);
      barPress.set(withSpring(1, motion.springs.barPressIn));
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
      const tapping = tapSlide.get() > 0 && !moved.get();
      lift.set(
        moved.get()
          ? settle
          : withDelay(tapping ? slideTrail.get() * motion.tapSlide.liftHold : motion.tapHold, settle),
      );
      barPress.set(
        tapSlide.get() > 0 && !moved.get()
          ? withSpring(0, motion.springs.barPressOut)
          : withSequence(
              withSpring(1, motion.springs.barPressIn),
              withDelay(motion.barPressHold, withSpring(0, motion.springs.barPressOut)),
            ),
      );
      if (index >= 0) {
        if (!tapping) {
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
    const free = 1 - tapSlide.get();
    const stretchTarget = Math.min(1, filteredSpeed / motion.lensMoveSpeed) * motion.jelly.stretch * lift.get();
    const omega = (2 * Math.PI) / motion.jelly.period;
    const force =
      omega * omega * (stretchTarget - jelly.get()) -
      2 * motion.jelly.damping * omega * jellyVelocity.get() +
      motion.jelly.kick * acceleration * lift.get();
    approachSpeed.set(Math.max(approachSpeed.get() * Math.exp(-dt * motion.squish.memory), filteredSpeed));
    const nearLeft =
      position <= motion.jelly.endZone && Math.abs(leftEdge.get() - leftTarget.get()) < motion.squish.contact;
    const nearRight =
      position >= lastIndex - motion.jelly.endZone &&
      Math.abs(rightEdge.get() - rightTarget.get()) < motion.squish.contact;
    const endReached = nearLeft || nearRight;
    if (endReached && !atEnd.get() && lift.get() > 0.5) {
      wallSide.set(nearLeft ? -1 : 1);
      squishVelocity.set(
        squishVelocity.get() +
          Math.min(approachSpeed.get(), motion.squish.speedCap) *
            motion.squish.impact *
            lerp(1, motion.tapSlide.impact, tapSlide.get()),
      );
    }
    atEnd.set(endReached);
    const squishOmega = (2 * Math.PI) / motion.squish.period;
    const squishForce =
      -squishOmega * squishOmega * squish.get() - 2 * motion.squish.damping * squishOmega * squishVelocity.get();
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

    const reach = middleIndex > 0 ? (lift.get() * motion.lensEdgeReach * (position - middleIndex)) / middleIndex : 0;
    const center =
      barWidth.get() / 2 +
      pillShiftX.get() +
      (position - middleIndex) * width +
      reach +
      push.get() * motion.lensPushTravel;
    const restHalf = Math.min(layout.bubbleRestWidth, width + space[6]) / 2;
    const halfWidth = lerp(restHalf, (width / 2) * motion.lensLift.x, lift.get() * free);
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
      if (dragIndex.get() >= 0 || lift.get() > 0.001) {
        return;
      }
      sliding.set(false);
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
    const slide = tapSlide.get();
    const liftScale = lerp(
      lerp(
        layout.bubbleRestHeight / lensFullHeight,
        lerp(motion.lensLift.y, (fullHeight + motion.tapSlide.extraHeight) / lensFullHeight, slide),
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
      (1 + squish.get() * motion.squish.bulge);
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
    return {
      translateX:
        (left + right) / 2 -
        inlinePad -
        fullWidth / 2 +
        heading.get() * Math.abs(jelly.get()) * (span / 2) * motion.jelly.lean +
        wallSide.get() * squish.get() * (span / 2),
      translateY: barShiftY.get() + slide * lift.get() * motion.tapSlide.drop,
      scaleX,
      scaleY,
    };
  });

  const lensStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      opacity: edgesReady.get() ? lensPresence.get() * (1 - shine.get()) : 0,
      transform: [
        { translateX: geometry.translateX },
        { translateY: geometry.translateY },
        { scaleX: geometry.scaleX },
        { scaleY: geometry.scaleY },
      ],
    };
  });

  const lensGlassStyle = useAnimatedStyle(() => {
    const geometry = lensGeometry.get();
    return {
      opacity: edgesReady.get() ? lerp(lift.get(), clamp01(lift.get() * motion.tapSlide.glassRamp), tapSlide.get()) : 0,
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
      scaleY.get() * lerp(1, modeShrink, clamp01(searchMode.get())) * (1 + searchPress.press.get() * motion.pressGrow),
  );
  const searchFillStyle = useAnimatedStyle(() => ({
    opacity: searchPress.press.get(),
  }));
  const searchInkStyle = useAnimatedStyle(() => ({
    opacity: 1 - searchPress.press.get() * motion.pressIconDim,
  }));

  const barLiftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: Math.min(0, keyboardHeight.get() + bottom - space[8]) * clamp01(searchMode.get()),
      },
    ],
  }));

  const pillModeStyle = useAnimatedStyle(() => ({
    opacity: 1 - clamp01(searchMode.get() * 2.5),
  }));
  const searchContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: searchShiftX.get() }, { translateY: barShiftY.get() }, { scale: searchScale.get() }],
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
      };
    }
    const mode = searchMode.get();
    const settled = clamp01(mode);
    const detach = clamp01((mode - motion.searchDetach) / (1 - motion.searchDetach));
    const pad = glass.pad;

    const growX = barPress.get() * motion.barGrow.x * (1 - settled);
    const grow = barPress.get() * motion.barGrow.y * (1 - settled);
    const pillLeft = pillShiftX.get() + (width - width * scaleX.get()) / 2 - growX;
    const pillRight = pillLeft + width * scaleX.get() + growX * (1 + motion.barGrow.towardSearch);
    const pillTop = fullHeight * (1 - scaleY.get()) - grow;
    const backGrow = modeRadius * motion.pressGrow * backPress.press.get() * settled;
    const backLeft = lerp(pillLeft, pillLeft + modeInset, settled) - backGrow;
    const backRight = lerp(pillRight, pillLeft + modeInset + modeHeight, settled) + backGrow;
    const backTop = lerp(pillTop, modeInset, settled) - backGrow;
    const backBottom = lerp(fullHeight + grow, fullHeight - modeInset, settled) + backGrow;

    const slide = -width * (1 - scaleX.get()) + centerShiftX.get();
    const circleX = width + layout.tabBarGap + slide + fullHeight / 2 + searchShiftX.get();
    const circleY = fullHeight / 2 + barShiftY.get();
    const circleRadius = (fullHeight / 2) * searchScale.get();

    const fieldLeft = lerp(circleX - circleRadius, pillLeft + modeInset + modeHeight + layout.searchModeGap, settled);
    const fieldRight = lerp(circleX + circleRadius, circleX - modeRadius - layout.searchModeGap, detach);
    const fieldTop = lerp(circleY - circleRadius, modeInset, settled);
    const fieldBottom = lerp(circleY + circleRadius, fullHeight - modeInset, settled);

    return {
      blend: Math.max(
        glass.blend * clamp01(mode * 3),
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
      glowX: (leftEdge.get() + rightEdge.get()) / 2 + pad,
      glowY: fullHeight / 2 + pad,
      glowSpread: glass.pressGlowSpread,
      glowStrength: glass.pressGlow * shine.get() * (1 - settled),
      shapes: [
        backLeft + pad,
        backTop + pad,
        backRight + pad,
        backBottom + pad,
        circleX - circleRadius + pad,
        circleY - circleRadius + pad,
        circleX + circleRadius + pad,
        circleY + circleRadius + pad,
        ...(mode > 0 ? [fieldLeft + pad, fieldTop + pad, fieldRight + pad, fieldBottom + pad] : []),
      ],
    };
  });
  const searchGlyphStyle = useAnimatedStyle(() => ({
    opacity: 1 - clamp01(searchMode.get() * 2),
  }));
  const closeGlyphStyle = useAnimatedStyle(() => ({
    opacity: clamp01(searchMode.get() * 2 - 1),
  }));

  const pressScaleStyle = useAnimatedStyle(() => {
    const width = Math.max(barWidth.get(), 1);
    const growX = barPress.get() * motion.barGrow.x * (1 - clamp01(searchMode.get()));
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
    const growX = barPress.get() * motion.barGrow.x * open;
    const growY = barPress.get() * motion.barGrow.y * open;
    return {
      opacity: shine.get() * open,
      transform: [
        { translateX: (growX * (motion.barGrow.towardSearch - 1)) / 2 },
        { scaleX: 1 + (growX * (1 + motion.barGrow.towardSearch)) / width },
        { scaleY: 1 + (growY * 2) / fullHeight },
      ],
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
    const slide = tapSlide.get();
    const canal = slide * lift.get();
    const optics = lerp(1, clamp01(lift.get() * motion.tapSlide.glassRamp), slide);
    const pinchScale = lerp(1, motion.tapSlide.pinch, slide);
    const bendScale = optics * lerp(1, motion.tapSlide.bend, slide);
    const centerX = lensCenter;
    const centerY = fullHeight / 2 + geometry.translateY - barShiftY.get();
    return {
      sampleMaxX: Math.max(sampleMaxX, 1),
      pinch: glass.lensPinch * (1 - deflate.get()) * pinchScale,
      pinchLeft: glass.lensPinch * clamp01(1 - position / glass.lensPinchSideReach) * pinchScale,
      pinchRight: glass.lensPinch * clamp01(1 - (lastIndex - position) / glass.lensPinchSideReach) * pinchScale,
      refraction: glass.lensRefraction * bendScale,
      magnify: glass.lensMagnify * optics,
      dispersion: glass.lensDispersion * bendScale,
      ellipse: canal,
      clipLeft: -motion.canal.overflow - centerX,
      clipTop: -motion.canal.overflow - centerY,
      clipRight: barWidth.get() + motion.canal.overflow - centerX,
      clipBottom: fullHeight + motion.canal.overflow - centerY,
      clipScaleX: Math.max(geometry.scaleX, 0.01),
      clipScaleY: Math.max(geometry.scaleY, 0.01),
      clipSoft: motion.canal.soft,
      clipOn: canal,
    };
  });

  const lensFillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(shine.get(), [0, 1], [color.chrome.lens, color.chrome.lensActive]),
  }));

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
              <Animated.View style={[styles.pressFill, { backgroundColor: color.chrome.pressFill }, searchFillStyle]} />
              <Animated.View style={[styles.searchIcon, searchInkStyle]}>
                <Animated.View style={[styles.searchIcon, searchGlyphStyle]}>
                  <Icon name={searchTab.icon} size={layout.searchIconSize} label={searchTab.label} />
                </Animated.View>
                <Animated.View style={[styles.searchIcon, closeGlyphStyle]}>
                  <Icon name="close" size={layout.closeIconSize} />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </NativeGlassBackdrop>
      <Animated.View pointerEvents="none" style={[styles.lensOverlay, pillModeStyle, pressScaleStyle]}>
        <View style={styles.row} accessibilityRole="tablist">
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
              itemShift={itemShift}
              barShiftX={pillShiftX}
              barShiftY={barShiftY}
              onActivate={selectTab}
            />
          ))}
        </View>
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
                itemShift={itemShift}
                barShiftX={pillShiftX}
                barShiftY={barShiftY}
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
            overlay={revealGroup}
            inset={glass.lensPad}
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
            rimPrism={glass.lensRimPrism}
            specular={glass.lensSpecular}
            edgeSharp={glass.lensEdgeShade}
            sharpWidth={glass.lensShadeWidth}
            lightAngle={glass.lightAngle}
            tint={color.chrome.lensTint}
            rim={color.chrome.lensRim}
          />
        </Animated.View>
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
  },
  backdrop: {
    flexDirection: 'row',
    gap: layout.tabBarGap,
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
