export interface IgdbResult {
  id: number;
  name: string;
  slug?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  platforms?: { id: number; abbreviation?: string; name: string }[];
  total_rating?: number;
  total_rating_count?: number;
  aggregated_rating?: number;
  game_type?: { type: string };
  parent_game?: { id: number; name: string; cover?: { image_id: string } };
  involved_companies?: { company: { name: string }; developer: boolean }[];
  franchises?: { id: number; name: string }[];
  collections?: { id: number; name: string }[];
  hypes?: number;
}

export const RESULT_FIELDS =
  'name, slug, cover.image_id, first_release_date, platforms.abbreviation, platforms.name, total_rating, total_rating_count, aggregated_rating, game_type.type, parent_game.name, parent_game.cover.image_id, involved_companies.company.name, involved_companies.developer, franchises.name, collections.name, hypes';

export const toResult = (game: IgdbResult) => ({
  id: game.id,
  name: game.name,
  slug: game.slug ?? null,
  coverId: game.cover?.image_id ?? null,
  releaseDate: game.first_release_date ?? null,
  releaseYear: game.first_release_date ? new Date(game.first_release_date * 1000).getUTCFullYear() : null,
  platforms: (game.platforms ?? []).map((platform) => platform.abbreviation ?? platform.name),
  platformIds: (game.platforms ?? []).map((platform) => platform.id),
  rating: game.total_rating ? Math.round(game.total_rating) : null,
  type: game.game_type?.type ?? null,
  developer: game.involved_companies?.find((company) => company.developer)?.company.name ?? null,
  parent: game.parent_game
    ? { id: game.parent_game.id, name: game.parent_game.name, coverId: game.parent_game.cover?.image_id ?? null }
    : null,
});
