import type { GameStatus, Tier } from '@/db/types';
import type { IconName } from '@/icons/Icon';

export const statusLabels: Record<GameStatus, string> = {
  wishlist: 'Wishlist',
  backlog: 'Backlog',
  playing: 'Playing',
  beaten: 'Beaten',
  archived: 'Archived',
  dropped: 'Dropped',
};

export const tierLabels: Record<Tier, string> = {
  main_story: 'Main story',
  completionist: 'Completionist',
  platinum: 'Platinum',
};

export const statuses: GameStatus[] = ['playing', 'backlog', 'wishlist', 'beaten', 'archived', 'dropped'];

export const tiers: Tier[] = ['main_story', 'completionist', 'platinum'];

const addonTypes = ['DLC', 'Expansion', 'Pack', 'Season', 'Episode', 'Update'];

const typeLabels: Record<string, string> = {
  DLC: 'DLC',
  Expansion: 'Expansion',
  'Standalone Expansion': 'Standalone',
  Bundle: 'Bundle',
  Pack: 'Pack',
  Season: 'Season',
  Episode: 'Episode',
  Update: 'Update',
  Remake: 'Remake',
  Remaster: 'Remaster',
};

export const statusIcons: Record<GameStatus, IconName> = {
  playing: 'gamepad',
  backlog: 'backlog',
  wishlist: 'bookmark',
  beaten: 'flag',
  archived: 'archive',
  dropped: 'error',
};

export const isAddon = (type: string | null) => !!type && addonTypes.includes(type);

export const typeBadge = (type: string | null) => (type ? (typeLabels[type] ?? null) : null);

export const kindLabel = (type: string | null) => (isAddon(type) ? 'DLC' : (typeBadge(type) ?? 'Game'));
