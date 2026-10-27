import type { CatalogGame } from '@/lib/catalog';
import { isAddon } from '@/shared/game/labels';

const platformLimit = 3;

export const platformsFor = (game: CatalogGame, yours: number[]) => {
  const mine = game.platforms.filter((_, index) => yours.includes(game.platformIds[index]));
  return (mine.length > 0 ? mine : game.platforms).slice(0, platformLimit).join(', ');
};

const join = (parts: (string | number | null | undefined)[]) => parts.filter(Boolean).join(' · ');

export const similarSubtitle = (game: CatalogGame) =>
  isAddon(game.type) && game.parent ? join([game.parent.name, game.releaseYear]) : join([game.releaseYear]);

export const franchiseSubtitle = (game: CatalogGame & { franchise: string | null }) =>
  join([game.franchise, game.releaseYear]);

export const ratedSubtitle = (game: CatalogGame, yours: number[]) => {
  const everywhere = yours.length > 1 && yours.every((id) => game.platformIds.includes(id));
  return join([game.rating, everywhere ? 'All' : platformsFor(game, yours)]);
};
