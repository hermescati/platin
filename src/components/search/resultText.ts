import type { IconName } from '@/components/icon/Icon';
import type { GameStatus } from '@/db/types';
import type { CatalogGame } from '@/lib/catalog';

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

export const resultMeta = (game: CatalogGame) =>
  (isAddon(game.type) && game.parent
    ? [game.parent.name, game.releaseYear]
    : [game.releaseYear, game.developer]
  )
    .filter(Boolean)
    .join(' · ');
