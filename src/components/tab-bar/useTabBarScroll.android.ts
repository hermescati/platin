import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { setTabBarCollapsed, useTabBarCollapse } from '@/components/tab-bar/TabBarCollapse';
import { motion } from '@/theme/tokens';

export const useTabBarScroll = () => {
  const collapse = useTabBarCollapse();
  const lastOffset = useSharedValue(0);
  const travelled = useSharedValue(0);

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;
      const delta = offset - lastOffset.get();
      lastOffset.set(offset);
      if (!collapse) {
        return;
      }
      if (offset <= motion.collapseTopOffset) {
        travelled.set(0);
        setTabBarCollapsed(collapse, 0);
        return;
      }
      const previous = travelled.get();
      const next = Math.sign(delta) === Math.sign(previous) || previous === 0 ? previous + delta : delta;
      travelled.set(next);
      if (next > motion.collapseDistance) {
        setTabBarCollapsed(collapse, 1);
      } else if (next < -motion.collapseDistance) {
        setTabBarCollapsed(collapse, 0);
      }
    },
  });
};
