import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, spacing } from '@/theme/tokens';

export const useTabBarOffset = (): number => Math.max(useSafeAreaInsets().bottom + spacing.sm, spacing.md);

export const useTabBarInset = (): number => useTabBarOffset() + layout.tabBarHeight + spacing.md;
