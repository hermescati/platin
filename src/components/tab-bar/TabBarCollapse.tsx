import { createContext, useContext, type ReactNode } from 'react';
import { useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

export interface TabBarCollapseState {
  progress: SharedValue<number>;
  target: SharedValue<number>;
}

const TabBarCollapseContext = createContext<TabBarCollapseState | null>(null);

interface Props {
  children: ReactNode;
}

export const TabBarCollapseProvider = ({ children }: Props) => {
  const progress = useSharedValue(0);
  const target = useSharedValue(0);

  return <TabBarCollapseContext value={{ progress, target }}>{children}</TabBarCollapseContext>;
};

export const useTabBarCollapse = (): TabBarCollapseState | null => useContext(TabBarCollapseContext);

export const setTabBarCollapsed = (state: TabBarCollapseState, value: number) => {
  'worklet';
  if (state.target.get() === value) {
    return;
  }
  state.target.set(value);
  state.progress.set(withSpring(value, motion.springs.morph));
};
