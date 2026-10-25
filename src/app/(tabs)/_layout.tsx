import { NativeTabs } from 'expo-lucent';

import { primaryTabs, searchTab } from '@/components/navigation/tabs';
import { SearchQueryProvider } from '@/components/search/SearchQuery';
import { useTheme } from '@/theme/useTheme';

const TabsLayout = () => {
  const { color } = useTheme();

  return (
    <SearchQueryProvider>
      <NativeTabs tintColor={color.accent.default} minimizeBehavior="onScrollDown">
        {primaryTabs.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon src={tab.image} renderingMode="template" />
          </NativeTabs.Trigger>
        ))}
        <NativeTabs.Trigger name={searchTab.name} role="search">
          <NativeTabs.Trigger.Label>{searchTab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={searchTab.image} renderingMode="template" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SearchQueryProvider>
  );
};

export default TabsLayout;
