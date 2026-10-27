import { router } from 'expo-router';

import type { CatalogGame } from '@/lib/catalog';

export const openGame = (id: string) => router.push({ pathname: '/game/[id]', params: { id } });

export const openCatalogGame = (game: CatalogGame) =>
  router.push({ pathname: '/add-game', params: { game: JSON.stringify(game) } });
