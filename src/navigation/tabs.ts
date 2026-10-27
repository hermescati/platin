import type { IconName } from '@/icons/glyphs';

export interface TabConfig {
  name: string;
  label: string;
  glyph: IconName;
}

export const primaryTabs: TabConfig[] = [
  { name: 'home', label: 'Home', glyph: 'home' },
  { name: 'library', label: 'Library', glyph: 'library' },
  { name: 'activity', label: 'Activity', glyph: 'activity' },
  { name: 'profile', label: 'Profile', glyph: 'person' },
];

export const searchTab: TabConfig = { name: 'search', label: 'Search', glyph: 'search' };

export const searchPlaceholder = 'Games, franchises, studios';
