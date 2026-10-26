import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { igdb, IgdbError } from '../_shared/igdb.ts';

interface Named {
  id: number;
  name: string;
}

interface IgdbGame {
  id: number;
  name: string;
  slug?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  game_type?: { type: string };
  parent_game?: { id: number };
  involved_companies?: { company: Named; developer: boolean; publisher: boolean }[];
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  game_modes?: Named[];
  genres?: Named[];
  updated_at?: number;
}

interface TimeToBeat {
  game_id: number;
  hastily?: number;
  normally?: number;
  completely?: number;
  count?: number;
}

const MAX_IDS = 100;
const MIN_TIME_TO_BEAT_COUNT = 3;
const ENDLESS_MODES = ['Massively Multiplayer Online (MMO)', 'Battle Royale'];
const ENDLESS_GENRES = ['Racing', 'Sport', 'Fighting', 'Card & Board Game', 'Pinball', 'MOBA'];
const STORY_GENRES = ['Adventure', 'Role-playing (RPG)', 'Platform', 'Puzzle', 'Point-and-click', 'Visual Novel'];

const GAME_FIELDS = [
  'name',
  'slug',
  'summary',
  'storyline',
  'cover.image_id',
  'first_release_date',
  'release_dates.date',
  'release_dates.platform',
  'game_type.type',
  'parent_game.name',
  'parent_game.cover.image_id',
  'version_parent',
  'involved_companies.company.name',
  'involved_companies.developer',
  'involved_companies.publisher',
  'aggregated_rating',
  'aggregated_rating_count',
  'total_rating',
  'total_rating_count',
  'game_modes.name',
  'genres.name',
  'themes.name',
  'player_perspectives.name',
  'franchises.name',
  'collections.name',
  'platforms.name',
  'platforms.abbreviation',
  'screenshots.image_id',
  'videos.video_id',
  'dlcs.name',
  'dlcs.cover.image_id',
  'dlcs.first_release_date',
  'expansions.name',
  'expansions.cover.image_id',
  'expansions.first_release_date',
  'standalone_expansions.name',
  'standalone_expansions.cover.image_id',
  'standalone_expansions.first_release_date',
  'similar_games.name',
  'similar_games.cover.image_id',
  'similar_games.first_release_date',
  'updated_at',
].join(', ');

const hasEnding = (game: IgdbGame, timeToBeat: TimeToBeat | undefined) => {
  const modes = (game.game_modes ?? []).map((mode) => mode.name);
  const genres = (game.genres ?? []).map((genre) => genre.name);
  if (modes.some((mode) => ENDLESS_MODES.includes(mode))) {
    return false;
  }
  if (timeToBeat?.completely && !timeToBeat.hastily && !timeToBeat.normally) {
    return false;
  }
  if (genres.some((genre) => STORY_GENRES.includes(genre))) {
    return true;
  }
  const singlePlayer = modes.length === 0 || modes.includes('Single player');
  return singlePlayer && !genres.some((genre) => ENDLESS_GENRES.includes(genre));
};

const toRecord = (game: IgdbGame, timeToBeat: TimeToBeat | undefined) => {
  const trusted = (timeToBeat?.count ?? 0) >= MIN_TIME_TO_BEAT_COUNT;
  return {
    igdbId: game.id,
    name: game.name,
    slug: game.slug ?? null,
    coverImageId: game.cover?.image_id ?? null,
    releaseDate: game.first_release_date ?? null,
    gameType: game.game_type?.type ?? null,
    parentIgdbId: game.parent_game?.id ?? null,
    developer: game.involved_companies?.find((company) => company.developer)?.company.name ?? null,
    criticScore: game.aggregated_rating ?? null,
    criticCount: game.aggregated_rating_count ?? null,
    mainStorySeconds: trusted ? (timeToBeat?.hastily ?? null) : null,
    completionistSeconds: trusted ? (timeToBeat?.completely ?? null) : null,
    hasEnding: hasEnding(game, timeToBeat),
    data: { ...game, time_to_beat: timeToBeat ?? null },
    igdbUpdatedAt: game.updated_at ?? null,
  };
};

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Use POST' }, { status: 405 });
    }

    const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
    const ids = Array.isArray(body?.ids) ? [...new Set(body.ids.filter(Number.isInteger))] : [];
    if (ids.length === 0 || ids.length > MAX_IDS) {
      return Response.json({ error: `Send 1-${MAX_IDS} game ids` }, { status: 400 });
    }

    try {
      const list = ids.join(',');
      const [games, timesToBeat] = await Promise.all([
        igdb<IgdbGame[]>('games', `fields ${GAME_FIELDS}; where id = (${list}); limit ${ids.length};`),
        igdb<TimeToBeat[]>(
          'game_time_to_beats',
          `fields game_id, hastily, normally, completely, count; where game_id = (${list}); limit ${ids.length};`,
        ),
      ]);
      const byGame = new Map(timesToBeat.map((entry) => [entry.game_id, entry]));
      return Response.json({ games: games.map((game) => toRecord(game, byGame.get(game.id))) });
    } catch (error) {
      if (error instanceof IgdbError) {
        return Response.json({ error: error.message }, { status: 502 });
      }
      return Response.json({ error: error instanceof Error ? error.message : 'Lookup failed' }, { status: 500 });
    }
  }),
};
