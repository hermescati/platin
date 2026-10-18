import type { Href } from 'expo-router';
import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

export interface TabIcon {
  ios: SFSymbol;
  iosSelected: SFSymbol;
  android: AndroidSymbol;
}

export interface TabConfig {
  name: string;
  href: Href;
  label: string;
  icon: TabIcon;
}

export const primaryTabs: TabConfig[] = [
  {
    name: 'home',
    href: '/home',
    label: 'Home',
    icon: { ios: 'house', iosSelected: 'house.fill', android: 'home' },
  },
  {
    name: 'library',
    href: '/library',
    label: 'Library',
    icon: { ios: 'square.stack', iosSelected: 'square.stack.fill', android: 'stacks' },
  },
  {
    name: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: { ios: 'person.crop.circle', iosSelected: 'person.crop.circle.fill', android: 'account_circle' },
  },
];

export const searchTab: TabConfig = {
  name: 'search',
  href: '/search',
  label: 'Search',
  icon: { ios: 'magnifyingglass', iosSelected: 'magnifyingglass', android: 'search' },
};

export const allTabs: TabConfig[] = [...primaryTabs, searchTab];
