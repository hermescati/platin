import type { Href } from 'expo-router';
import type { AndroidSymbol } from 'expo-symbols';

export interface TabConfig {
  name: string;
  href: Href;
  label: string;
  icon: AndroidSymbol;
}

export const primaryTabs: TabConfig[] = [
  { name: 'home', href: '/home', label: 'Home', icon: 'home' },
  { name: 'library', href: '/library', label: 'Library', icon: 'stacks' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'account_circle' },
];

export const searchTab: TabConfig = { name: 'search', href: '/search', label: 'Search', icon: 'search' };

export const allTabs: TabConfig[] = [...primaryTabs, searchTab];
