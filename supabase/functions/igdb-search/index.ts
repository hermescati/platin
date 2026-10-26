import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { igdb, IgdbError } from '../_shared/igdb.ts';

interface IgdbGame {
  id: number;
  name: string;
  slug?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  platforms?: { id: number; abbreviation?: string; name: string }[];
  total_rating?: number;
  total_rating_count?: number;
  game_type?: { type: string };
  parent_game?: { id: number; name: string; cover?: { image_id: string } };
  involved_companies?: { company: { name: string }; developer: boolean }[];
}

const RESULT_LIMIT = 20;
const MIN_QUERY = 2;
const MAX_QUERY = 100;

const searchBody = (query: string) => {
  const escaped = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [
    `search "${escaped}";`,
    'fields name, slug, cover.image_id, first_release_date, platforms.abbreviation, platforms.name, total_rating, total_rating_count, game_type.type, parent_game.name, parent_game.cover.image_id, involved_companies.company.name, involved_companies.developer;',
    'where version_parent = null;',
    `limit ${RESULT_LIMIT};`,
  ].join(' ');
};

const toResult = (game: IgdbGame) => ({
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

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Use POST' }, { status: 405 });
    }

    const body = (await req.json().catch(() => null)) as { query?: unknown } | null;
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    if (query.length < MIN_QUERY || query.length > MAX_QUERY) {
      return Response.json({ error: `Query must be ${MIN_QUERY}-${MAX_QUERY} characters` }, { status: 400 });
    }

    try {
      const games = await igdb<IgdbGame[]>('games', searchBody(query));
      const ranked = games
        .map((game, index) => ({ game, index }))
        .sort((a, b) => (b.game.total_rating_count ?? 0) - (a.game.total_rating_count ?? 0) || a.index - b.index)
        .map(({ game }) => toResult(game));
      return Response.json({ results: ranked });
    } catch (error) {
      if (error instanceof IgdbError) {
        return Response.json({ error: error.message }, { status: 502 });
      }
      return Response.json({ error: error instanceof Error ? error.message : 'Search failed' }, { status: 500 });
    }
  }),
};
