import type { GameStatus, Tier } from '@/db/types';

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
