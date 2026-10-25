import type { ImageSourcePropType } from 'react-native';

export interface TabConfig {
  name: string;
  label: string;
  image: { default: ImageSourcePropType; selected: ImageSourcePropType };
}

export const primaryTabs: TabConfig[] = [
  {
    name: 'home',
    label: 'Home',
    image: { default: require('@/assets/tab-icons/home.png'), selected: require('@/assets/tab-icons/home-fill.png') },
  },
  {
    name: 'library',
    label: 'Library',
    image: {
      default: require('@/assets/tab-icons/library.png'),
      selected: require('@/assets/tab-icons/library-fill.png'),
    },
  },
  {
    name: 'activity',
    label: 'Activity',
    image: {
      default: require('@/assets/tab-icons/activity.png'),
      selected: require('@/assets/tab-icons/activity-fill.png'),
    },
  },
  {
    name: 'profile',
    label: 'Profile',
    image: {
      default: require('@/assets/tab-icons/person.png'),
      selected: require('@/assets/tab-icons/person-fill.png'),
    },
  },
];

export const searchTab: TabConfig = {
  name: 'search',
  label: 'Search',
  image: { default: require('@/assets/tab-icons/search.png'), selected: require('@/assets/tab-icons/search.png') },
};

export const searchPlaceholder = 'Games, library, platforms';
