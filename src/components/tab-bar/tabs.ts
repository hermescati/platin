import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

export interface TabConfig {
  name: string;
  href: Href;
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
}

export const primaryTabs: TabConfig[] = [
  { name: 'home', href: '/home', label: 'Home', icon: 'home' },
  { name: 'library', href: '/library', label: 'Library', icon: 'inventory-2' },
  { name: 'discover', href: '/discover', label: 'Discover', icon: 'explore' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'account-circle' },
];

export const searchTab: TabConfig = { name: 'search', href: '/search', label: 'Search', icon: 'search' };

export const allTabs: TabConfig[] = [...primaryTabs, searchTab];

export const searchPlaceholder = 'Games, library, platforms';
