import { StyleSheet, View } from 'react-native';

import { GlassSurface } from '@/components/glass/GlassSurface';
import { TabBarItem } from '@/components/tab-bar/TabBarItem';
import { primaryTabs, searchTab } from '@/components/tab-bar/tabs';
import { useTabBarOffset } from '@/components/tab-bar/useTabBarInset';
import { layout, radius, spacing } from '@/theme/tokens';

export const FloatingTabBar = () => {
  const bottom = useTabBarOffset();

  return (
    <View style={[styles.bar, { bottom }]} pointerEvents="box-none" accessibilityRole="tablist">
      <GlassSurface interactive style={styles.pill}>
        {primaryTabs.map((tab) => (
          <TabBarItem key={tab.name} tab={tab} />
        ))}
      </GlassSurface>
      <GlassSurface interactive style={styles.search}>
        <TabBarItem tab={searchTab} showLabel={false} />
      </GlassSurface>
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
  pill: {
    flex: 1,
    flexDirection: 'row',
    height: layout.tabBarHeight,
    padding: spacing.xs,
    borderRadius: radius.pill,
  },
  search: {
    width: layout.tabBarHeight,
    height: layout.tabBarHeight,
    padding: spacing.xs,
    borderRadius: radius.pill,
  },
});
