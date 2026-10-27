import type { CatalogGame } from '@/lib/catalog';
import { isAddon } from '@/shared/game/labels';

export const resultMeta = (game: CatalogGame) =>
  (isAddon(game.type) && game.parent
    ? [game.parent.name, game.releaseYear]
    : [game.releaseYear, game.developer]
  )
    .filter(Boolean)
    .join(' · ');
