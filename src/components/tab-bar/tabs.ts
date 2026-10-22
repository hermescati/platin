import type { Href } from 'expo-router';
import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icon/Icon';

export interface TabConfig {
  name: string;
  href: Href;
  label: string;
  icon: IconName;
  image: { default: ImageSourcePropType; selected: ImageSourcePropType };
}

export const primaryTabs: TabConfig[] = [
  {
    name: 'home',
    href: '/home',
    label: 'Home',
    icon: 'home',
    image: { default: require('@/assets/tab-icons/home.png'), selected: require('@/assets/tab-icons/home-fill.png') },
  },
  {
    name: 'library',
    href: '/library',
    label: 'Library',
    icon: 'library',
    image: {
      default: require('@/assets/tab-icons/library.png'),
      selected: require('@/assets/tab-icons/library-fill.png'),
    },
  },
  {
    name: 'activity',
    href: '/activity',
    label: 'Activity',
    icon: 'activity',
    image: {
      default: require('@/assets/tab-icons/activity.png'),
      selected: require('@/assets/tab-icons/activity-fill.png'),
    },
  },
  {
    name: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: 'person',
    image: {
      default: require('@/assets/tab-icons/person.png'),
      selected: require('@/assets/tab-icons/person-fill.png'),
    },
  },
];

export const searchTab: TabConfig = {
  name: 'search',
  href: '/search',
  label: 'Search',
  icon: 'search',
  image: { default: require('@/assets/tab-icons/search.png'), selected: require('@/assets/tab-icons/search.png') },
};

export const allTabs: TabConfig[] = [...primaryTabs, searchTab];

export const searchPlaceholder = 'Games, library, platforms';
