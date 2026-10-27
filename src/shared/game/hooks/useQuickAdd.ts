import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { addCatalogGame, removeGame, setStatus } from '@/db/library';
import { fetchPlatformsByIds, fetchUserPlatformIds } from '@/db/platforms';
import type { GameStatus, LibraryGame, Platform } from '@/db/types';
import type { CatalogGame } from '@/lib/catalog';
import { statusLabels } from '@/shared/game/labels';
import type { MenuItem } from '@/ui/Menu';

export interface QuickAddTarget {
  game: CatalogGame;
  entry?: LibraryGame;
}

interface QuickAddMenu extends QuickAddTarget {
  step: 'status' | 'platform';
  status?: GameStatus;
  platforms?: Platform[];
}

interface Options {
  onAdded: (game: CatalogGame, status: GameStatus) => void;
  onMessage: (message: string) => void;
}

const addStatusItems: MenuItem[] = [
  { key: 'playing', label: 'Playing', sub: 'Started it', icon: 'gamepad' },
  { key: 'backlog', label: 'Backlog', sub: 'Own it, not started', icon: 'backlog' },
  { key: 'wishlist', label: 'Wishlist', sub: 'Want it', icon: 'bookmark' },
  { key: 'beaten', label: 'Beaten', sub: 'Finished it', icon: 'flag' },
];

const ownedStatusItems: MenuItem[] = [
  ...addStatusItems.map(({ key, label, icon }) => ({ key, label, icon })),
  { key: 'remove', label: 'Remove from library', icon: 'trash', destructive: true, groupStart: true },
];

const platformLabel = (platform: Platform) => platform.name.replace(/\s*\(.*\)$/, '');

export const useQuickAdd = ({ onAdded, onMessage }: Options) => {
  const db = useSQLiteContext();
  const [menu, setMenu] = useState<QuickAddMenu | null>(null);

  const close = () => setMenu(null);

  const open = (target: QuickAddTarget) => setMenu({ ...target, step: 'status' });

  const add = async (game: CatalogGame, status: GameStatus, platformIds: number[]) => {
    setMenu(null);
    await addCatalogGame(db, game, status, platformIds);
    onAdded(game, status);
  };

  const chooseStatus = async (current: QuickAddMenu, status: GameStatus) => {
    if (current.entry) {
      await setStatus(db, current.entry.id, status);
      setMenu(null);
      onMessage(`Moved to ${statusLabels[status]}`);
      return;
    }
    if (status === 'wishlist') {
      await add(current.game, status, []);
      return;
    }
    const [yours, gamePlatforms] = await Promise.all([
      fetchUserPlatformIds(db),
      fetchPlatformsByIds(db, current.game.platformIds),
    ]);
    const matching = gamePlatforms.filter((platform) => yours.includes(platform.id));
    const choices = matching.length > 0 ? matching : gamePlatforms;
    if (choices.length <= 1) {
      await add(current.game, status, choices.map((platform) => platform.id));
      return;
    }
    setMenu({ ...current, step: 'platform', status, platforms: choices });
  };

  const select = async (key: string) => {
    if (!menu) {
      return;
    }
    if (menu.step === 'platform' && menu.status) {
      await add(menu.game, menu.status, [Number(key)]);
      return;
    }
    if (key === 'remove' && menu.entry) {
      await removeGame(db, menu.entry.id);
      setMenu(null);
      onMessage(`Removed ${menu.game.name}`);
      return;
    }
    await chooseStatus(menu, key as GameStatus);
  };

  const title = !menu ? '' : menu.step === 'platform' ? 'Add on which platform?' : menu.entry ? 'Status' : 'Add to library as';

  const items: MenuItem[] = !menu
    ? []
    : menu.step === 'platform'
      ? (menu.platforms ?? []).map((platform) => ({ key: String(platform.id), label: platformLabel(platform) }))
      : menu.entry
        ? ownedStatusItems
        : addStatusItems;

  return { menu, open, close, select, add, title, items, selected: menu?.entry?.status };
};
