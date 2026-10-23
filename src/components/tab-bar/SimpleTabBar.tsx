import { AndroidHaptics, performAndroidHapticsAsync } from 'expo-haptics';
import { useTabTrigger } from 'expo-router/ui';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';

import { NativeGlassView } from '@/components/glass/NativeGlass';
import { Icon } from '@/components/icon/Icon';
import { useKeyboardHeight } from '@/components/keyboard/useKeyboardHeight';
import { useSearchQuery } from '@/components/search/SearchQuery';
import { SearchMode } from '@/components/tab-bar/SearchMode';
import { primaryTabs as tabs, searchTab, type TabConfig } from '@/components/tab-bar/tabs';
import { useGlassPress } from '@/components/tab-bar/useGlassPress';
import { useTabBarOffset } from '@/components/tab-bar/useTabBarInset';
import { glass, layout, motion, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const fullHeight = layout.tabBarHeight;
const inlinePad = layout.tabBarInlinePadding;
const modeHeight = layout.searchModeHeight;
const modeInset = (fullHeight - modeHeight) / 2;
const canBlur = Platform.OS === 'android' && Platform.Version >= 31;

const clamp01 = (value: number) => {
  'worklet';
  return Math.min(1, Math.max(0, value));
};

const tick = () => {
  performAndroidHapticsAsync(AndroidHaptics.Segment_Tick);
};

interface SurfaceProps {
  style: StyleProp<ViewStyle>;
  radius: number;
  children?: ReactNode;
}

const Surface = ({ style, radius, children }: SurfaceProps) => {
  const { color } = useTheme();

  return (
    <Animated.View
      style={[
        style,
        {
          borderRadius: radius,
          borderColor: color.chrome.solidRim,
          boxShadow: `${glass.solidShadow} ${color.chrome.shadow}`,
        },
        styles.surface,
      ]}>
      <View style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }]} pointerEvents="none">
        {canBlur && (
          <NativeGlassView style={StyleSheet.absoluteFill} blurRadius={glass.solidBlur} bezel={0} refraction={0} />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: canBlur ? color.chrome.solidFill : color.chrome.solidFillOpaque },
          ]}
        />
      </View>
      {children}
    </Animated.View>
  );
};

interface TabButtonProps {
  tab: TabConfig;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

const TabButton = ({ tab, index, selected, onSelect }: TabButtonProps) => {
  const { color } = useTheme();
  const { press, onPressIn, onPressOut } = useGlassPress();
  const pressStyle = useAnimatedStyle(() => ({ opacity: press.get() * glass.solidPress }));

  return (
    <View style={styles.slot}>
      <Pressable
        style={styles.press}
        onPress={() => onSelect(index)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected }}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: color.chrome.pressFill }, pressStyle]}
        />
        <Icon
          name={tab.icon}
          variant={selected ? 'fill' : 'outline'}
          size={layout.tabIconSize}
          tone={selected ? 'accent' : undefined}
        />
        <Animated.Text
          style={[styles.label, { color: selected ? color.accent.default : color.text.primary }]}
          numberOfLines={1}>
          {tab.label}
        </Animated.Text>
      </Pressable>
    </View>
  );
};

interface IndicatorProps {
  position: SharedValue<number>;
  presence: SharedValue<number>;
  itemWidth: SharedValue<number>;
}

const Indicator = ({ position, presence, itemWidth }: IndicatorProps) => {
  const { color } = useTheme();

  const indicatorStyle = useAnimatedStyle(() => {
    const width = itemWidth.get();
    const size = Math.min(layout.bubbleRestWidth, width + space[6]);
    return {
      opacity: width > 0 ? presence.get() : 0,
      width: size,
      transform: [{ translateX: inlinePad + position.get() * width + (width - size) / 2 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.indicator, { backgroundColor: color.chrome.lens }, indicatorStyle]}
    />
  );
};

export const SimpleTabBar = () => {
  const bottom = useTabBarOffset();
  const window = useWindowDimensions();
  const barSpan = Math.min(window.width - layout.tabBarSideInset * 2, layout.tabBarMaxWidth);
  const barLeft = (window.width - barSpan) / 2;
  const { getTrigger, switchTab } = useTabTrigger({ name: tabs[0].name });
  const focusedIndex = tabs.findIndex((tab) => getTrigger(tab.name)?.isFocused);
  const searchFocused = getTrigger(searchTab.name)?.isFocused ?? false;
  const { setQuery } = useSearchQuery();
  const keyboardHeight = useKeyboardHeight();
  const [backIndex, setBackIndex] = useState(Math.max(focusedIndex, 0));
  if (focusedIndex >= 0 && focusedIndex !== backIndex) {
    setBackIndex(focusedIndex);
  }

  const position = useSharedValue(Math.max(focusedIndex, 0));
  const presence = useSharedValue(focusedIndex >= 0 ? 1 : 0);
  const itemWidth = useSharedValue(0);
  const searchMode = useSharedValue(searchFocused ? 1 : 0);
  const backPress = useGlassPress();

  useEffect(() => {
    if (focusedIndex >= 0) {
      position.set(withSpring(focusedIndex, motion.springs.lens));
    }
    presence.set(withSpring(focusedIndex >= 0 ? 1 : 0, motion.springs.morph));
  }, [focusedIndex, position, presence]);

  useEffect(() => {
    searchMode.set(withSpring(searchFocused ? 1 : 0, motion.springs.searchMorph));
  }, [searchFocused, searchMode]);

  const selectTab = (index: number) => {
    if (index !== focusedIndex) {
      tick();
    }
    switchTab(tabs[index].name, {});
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

  const onRowLayout = (event: LayoutChangeEvent) => {
    itemWidth.set((event.nativeEvent.layout.width - inlinePad * 2) / tabs.length);
  };

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(0, keyboardHeight.get() + bottom - space[8]) * clamp01(searchMode.get()) }],
  }));
  const tabModeStyle = useAnimatedStyle(() => ({ opacity: 1 - clamp01(searchMode.get() * 2) }));
  const searchModeStyle = useAnimatedStyle(() => ({ opacity: clamp01(searchMode.get() * 2 - 1) }));
  const searchGlyphStyle = useAnimatedStyle(() => ({ opacity: 1 - clamp01(searchMode.get() * 2) }));
  const closeGlyphStyle = useAnimatedStyle(() => ({ opacity: clamp01(searchMode.get() * 2 - 1) }));

  return (
    <Animated.View style={[styles.bar, { bottom, left: barLeft, width: barSpan }, liftStyle]} pointerEvents="box-none">
      <Animated.View style={[styles.row, tabModeStyle]} pointerEvents={searchFocused ? 'none' : 'box-none'}>
        <Surface style={styles.pill} radius={fullHeight / 2}>
          <View style={styles.tabs} onLayout={onRowLayout} accessibilityRole="tablist">
            <Indicator position={position} presence={presence} itemWidth={itemWidth} />
            {tabs.map((tab, index) => (
              <TabButton
                key={tab.name}
                tab={tab}
                index={index}
                selected={index === focusedIndex}
                onSelect={selectTab}
              />
            ))}
          </View>
        </Surface>
        <View style={styles.circleSpace} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, searchModeStyle]} pointerEvents="none">
        <Surface style={styles.back} radius={modeHeight / 2} />
        <Surface style={styles.field} radius={modeHeight / 2} />
        <Surface style={styles.close} radius={modeHeight / 2} />
      </Animated.View>
      <Pressable
        style={styles.searchButton}
        onPress={searchFocused ? closeSearch : openSearch}
        accessibilityRole="tab"
        accessibilityLabel={searchFocused ? 'Close search' : searchTab.label}
        accessibilityState={{ selected: searchFocused }}>
        <Animated.View style={[StyleSheet.absoluteFill, tabModeStyle]}>
          <Surface style={StyleSheet.absoluteFill} radius={fullHeight / 2} />
        </Animated.View>
        <Animated.View style={[styles.center, searchGlyphStyle]}>
          <Icon name={searchTab.icon} size={layout.searchIconSize} label={searchTab.label} />
        </Animated.View>
        <Animated.View style={[styles.center, closeGlyphStyle]}>
          <Icon name="close" size={layout.tabIconSize} />
        </Animated.View>
      </Pressable>
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
    height: fullHeight,
  },
  row: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    gap: layout.tabBarGap,
  },
  surface: {
    borderWidth: layout.hairline,
  },
  clip: {
    overflow: 'hidden',
  },
  pill: {
    flex: 1,
    height: fullHeight,
  },
  tabs: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    paddingHorizontal: inlinePad,
  },
  circleSpace: {
    width: fullHeight,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: (fullHeight - layout.bubbleRestHeight) / 2 - layout.hairline,
    height: layout.bubbleRestHeight,
    borderRadius: layout.bubbleRestHeight / 2,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  press: {
    width: '100%',
    maxWidth: layout.bubbleRestWidth,
    height: layout.bubbleRestHeight,
    borderRadius: layout.bubbleRestHeight / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: layout.tabLabelSize,
    fontWeight: '500',
    textAlign: 'center',
    height: layout.tabLabelHeight,
  },
  searchButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: fullHeight,
    height: fullHeight,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  close: {
    position: 'absolute',
    right: modeInset,
    top: modeInset,
    width: modeHeight,
    height: modeHeight,
  },
});
