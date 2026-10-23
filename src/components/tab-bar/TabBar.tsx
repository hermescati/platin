import { requireOptionalNativeModule } from 'expo';

import { FloatingTabBar } from '@/components/tab-bar/FloatingTabBar';
import { SimpleTabBar } from '@/components/tab-bar/SimpleTabBar';

interface GlassModule {
  glassSupported?: boolean;
}

const supportsGlass = requireOptionalNativeModule<GlassModule>('PlatinGlass')?.glassSupported === true;

export const TabBar = supportsGlass ? FloatingTabBar : SimpleTabBar;
