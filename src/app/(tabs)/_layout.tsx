import { NativeTabs } from 'expo-lucent';

import { glyphMarkup } from '@/icons/glyphMarkup';
import { primaryTabs, searchTab, type TabConfig } from '@/navigation/tabs';
import { useTheme } from '@/theme/useTheme';

const tabIcon = (tab: TabConfig) => ({ default: glyphMarkup(tab.glyph), selected: glyphMarkup(tab.glyph, 'fill') });

const TabsLayout = () => {
  const { color } = useTheme();

  return (
    <NativeTabs tintColor={color.accent.default} minimizeBehavior="onScrollDown">
      {primaryTabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon svg={tabIcon(tab)} />
        </NativeTabs.Trigger>
      ))}
      <NativeTabs.Trigger name={searchTab.name} role="search">
        <NativeTabs.Trigger.Label>{searchTab.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon svg={tabIcon(searchTab)} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
