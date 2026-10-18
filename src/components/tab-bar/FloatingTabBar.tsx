import { performAndroidHapticsAsync, AndroidHaptics } from 'expo-haptics';
import { useTabTrigger } from 'expo-router/ui';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { GlassSurface } from '@/components/glass/GlassSurface';
import { TabBarItem } from '@/components/tab-bar/TabBarItem';
import { primaryTabs, searchTab } from '@/components/tab-bar/tabs';
import { useTabBarOffset } from '@/components/tab-bar/useTabBarInset';
import { layout, motion, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const tabCount = primaryTabs.length;
const lensLiftDelta = motion.lensLift - 1;

const tick = () => {
  performAndroidHapticsAsync(AndroidHaptics.Segment_Tick);
};

export const FloatingTabBar = () => {
  const bottom = useTabBarOffset();
  const { color } = useTheme();
  const { getTrigger, switchTab } = useTabTrigger({ name: searchTab.name });
  const focusedIndex = primaryTabs.findIndex((tab) => getTrigger(tab.name)?.isFocused);
  const searchFocused = getTrigger(searchTab.name)?.isFocused ?? false;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const highlightedIndex = hoverIndex ?? focusedIndex;

  const itemWidth = useSharedValue(0);
  const lensX = useSharedValue(0);
  const lift = useSharedValue(0);
  const stretch = useSharedValue(1);
  const focused = useSharedValue(focusedIndex);
  const dragIndex = useSharedValue(-1);

  useEffect(() => {
    focused.set(focusedIndex);
    if (focusedIndex >= 0) {
      lensX.set(withSpring(focusedIndex * itemWidth.get(), motion.spring));
    }
  }, [focusedIndex, focused, lensX, itemWidth]);

  const selectTab = (index: number) => {
    setHoverIndex(null);
    switchTab(primaryTabs[index].name, {});
  };

  const hoverTab = (index: number) => {
    setHoverIndex(index);
    tick();
  };

  const onPillLayout = (event: LayoutChangeEvent) => {
    const width = (event.nativeEvent.layout.width - spacing.xs * 2) / tabCount;
    itemWidth.set(width);
    lensX.set(Math.max(focusedIndex, 0) * width);
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (event) => {
      const width = itemWidth.get();
      const index = Math.min(tabCount - 1, Math.max(0, Math.floor((event.x - spacing.xs) / width)));
      dragIndex.set(index);
      lift.set(withSpring(1, motion.spring));
      lensX.set(withSpring(index * width, motion.spring));
      scheduleOnRN(hoverTab, index);
    },
    onUpdate: (event) => {
      const width = itemWidth.get();
      const position = Math.min((tabCount - 1) * width, Math.max(0, event.x - spacing.xs - width / 2));
      lensX.set(position);
      stretch.set(1 + Math.min(Math.abs(event.velocityX) / motion.stretchVelocity, motion.lensMaxStretch));
      const index = Math.round(position / width);
      if (index !== dragIndex.get()) {
        dragIndex.set(index);
        scheduleOnRN(hoverTab, index);
      }
    },
    onFinalize: (event) => {
      const index = event.canceled ? focused.get() : dragIndex.get();
      lift.set(withSpring(0, motion.spring));
      stretch.set(withSpring(1, motion.spring));
      if (index >= 0) {
        lensX.set(withSpring(index * itemWidth.get(), motion.spring));
      }
      if (event.canceled || index < 0) {
        scheduleOnRN(setHoverIndex, null);
      } else {
        scheduleOnRN(selectTab, index);
      }
    },
  });

  const lensStyle = useAnimatedStyle(() => {
    const scale = 1 + lift.get() * lensLiftDelta;
    return {
      width: itemWidth.get(),
      opacity: focused.get() >= 0 || lift.get() > 0 ? 1 : 0,
      backgroundColor: interpolateColor(lift.get(), [0, 1], [color.lens, color.lensActive]),
      transform: [{ translateX: lensX.get() }, { scaleX: scale * stretch.get() }, { scaleY: scale }],
    };
  });

  const openSearch = () => {
    tick();
    switchTab(searchTab.name, {});
  };

  return (
    <View style={[styles.bar, { bottom }]} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <View style={styles.pillFrame} onLayout={onPillLayout} accessibilityRole="tablist">
          <GlassSurface style={styles.pill}>
            <Animated.View style={[styles.lens, lensStyle]} />
            {primaryTabs.map((tab, index) => (
              <View
                key={tab.name}
                style={styles.slot}
                accessible
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: index === focusedIndex }}
                accessibilityActions={[{ name: 'activate' }]}
                onAccessibilityAction={() => selectTab(index)}>
                <TabBarItem tab={tab} focused={index === highlightedIndex} />
              </View>
            ))}
          </GlassSurface>
        </View>
      </GestureDetector>
      <Pressable
        onPress={openSearch}
        accessibilityRole="tab"
        accessibilityLabel={searchTab.label}
        accessibilityState={{ selected: searchFocused }}
        style={({ pressed }) => pressed && styles.pressed}>
        <GlassSurface style={styles.search}>
          <TabBarItem tab={searchTab} focused={searchFocused} showLabel={false} />
        </GlassSurface>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pillFrame: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    height: layout.tabBarHeight,
    padding: spacing.xs,
    borderRadius: radius.pill,
  },
  lens: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
    borderRadius: radius.pill,
  },
  slot: {
    flex: 1,
  },
  search: {
    width: layout.tabBarHeight,
    height: layout.tabBarHeight,
    padding: spacing.xs,
    borderRadius: radius.pill,
  },
  pressed: {
    transform: [{ scale: motion.pressScale }],
  },
});
