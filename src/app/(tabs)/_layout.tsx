import { NativeTabs } from 'expo-router/native-tabs';

import { SearchQueryProvider } from '@/components/search/SearchQuery';
import { useTheme } from '@/theme/useTheme';

const TabsLayout = () => {
  const { color } = useTheme();

  return (
    <SearchQueryProvider>
      <NativeTabs tintColor={color.accent} minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="library">
          <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'square.stack', selected: 'square.stack.fill' }} md="stacks" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="discover">
          <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'sparkles', selected: 'sparkles' }} md="explore" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md="account_circle"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="search"
          role="search"
          unstable_nativeProps={{ ios: { role: 'search', automaticallyActivatesSearch: true } }}>
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SearchQueryProvider>
  );
};

export default TabsLayout;
