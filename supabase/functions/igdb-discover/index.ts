import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { RESULT_FIELDS, toResult, type IgdbResult } from '../_shared/catalog.ts';
import { igdb, IgdbError } from '../_shared/igdb.ts';

interface DiscoverInput {
  platformIds: number[];
  wishlistIds: number[];
  similarIds: number[];
  franchiseIds: number[];
  collectionIds: number[];
}

interface QueryResult<T> {
  name: string;
  result: T[];
}

interface Popularity {
  game_id: number;
  value: number;
}

const MAX_IDS = 100;
const DAY = 24 * 60 * 60;
const FEATURED_LIMIT = 8;
const WISHLIST_LIMIT = 3;
const SHELF_LIMIT = 15;
const MIN_CRITICS = 4;
const VISITS = 1;
const FULL_GAMES = '(0,4,8,9,10)';
const FRANCHISE_GAMES = '(0,2,4,8,9,10)';

const ids = (value: unknown) =>
  Array.isArray(value) ? [...new Set(value.filter(Number.isInteger) as number[])].slice(0, MAX_IDS) : [];

const readInput = (body: Record<string, unknown> | null): DiscoverInput => ({
  platformIds: ids(body?.platformIds),
  wishlistIds: ids(body?.wishlistIds),
  similarIds: ids(body?.similarIds),
  franchiseIds: ids(body?.franchiseIds),
  collectionIds: ids(body?.collectionIds),
});

const list = (values: number[]) => `(${values.join(',')})`;

const query = (name: string, where: string[], sort: string | null, limit: number) =>
  [
    `query games "${name}" {`,
    `fields ${RESULT_FIELDS};`,
    `where ${where.join(' & ')};`,
    sort ? `sort ${sort};` : '',
    `limit ${limit};`,
    '};',
  ].join(' ');

const featuredTag = (game: IgdbResult, now: number, fallback: string) => {
  if (!game.first_release_date) {
    return 'Coming soon';
  }
  if (game.first_release_date > now) {
    return `Coming ${new Date(game.first_release_date * 1000).getUTCFullYear()}`;
  }
  return fallback;
};

const discover = async (input: DiscoverInput) => {
  const now = Math.floor(Date.now() / 1000);
  const yearStart = Math.floor(Date.UTC(new Date().getUTCFullYear(), 0, 1) / 1000);
  const onPlatforms = input.platformIds.length > 0 ? [`platforms = ${list(input.platformIds)}`] : [];
  const base = ['version_parent = null', 'cover != null'];
  const queries = [
    input.wishlistIds.length > 0 &&
      query('wishlist', [`id = ${list(input.wishlistIds)}`], 'first_release_date asc', input.wishlistIds.length),
    query(
      'upcoming',
      [...base, ...onPlatforms, `game_type = ${FULL_GAMES}`, `first_release_date > ${now}`, `first_release_date < ${now + 365 * DAY}`, 'hypes > 0'],
      'hypes desc',
      10,
    ),
    query(
      'recent',
      [...base, ...onPlatforms, `game_type = ${FULL_GAMES}`, `first_release_date > ${now - 30 * DAY}`, `first_release_date <= ${now}`],
      'hypes desc',
      10,
    ),
    query(
      'top',
      [...base, ...onPlatforms, `game_type = ${FULL_GAMES}`, `first_release_date >= ${yearStart}`, `first_release_date <= ${now}`, `aggregated_rating_count >= ${MIN_CRITICS}`],
      'aggregated_rating desc',
      SHELF_LIMIT,
    ),
    input.similarIds.length > 0 && query('similar', [...base, `id = ${list(input.similarIds)}`], null, input.similarIds.length),
    (input.franchiseIds.length > 0 || input.collectionIds.length > 0) &&
      query(
        'franchise',
        [
          ...base,
          `game_type = ${FRANCHISE_GAMES}`,
          `first_release_date > ${now - 3 * 365 * DAY}`,
          `(${[
            input.franchiseIds.length > 0 && `franchises = ${list(input.franchiseIds)}`,
            input.collectionIds.length > 0 && `collections = ${list(input.collectionIds)}`,
          ]
            .filter(Boolean)
            .join(' | ')})`,
        ],
        'first_release_date desc',
        SHELF_LIMIT,
      ),
    `query popularity_primitives "popular" { fields game_id, value; where popularity_type = ${VISITS}; sort value desc; limit 200; };`,
  ].filter(Boolean);

  const results = await igdb<QueryResult<IgdbResult | Popularity>[]>('multiquery', queries.join('\n'));
  const named = (name: string) => (results.find((entry) => entry.name === name)?.result ?? []) as IgdbResult[];
  const popular = (results.find((entry) => entry.name === 'popular')?.result ?? []) as Popularity[];

  const popularIds = popular.map((entry) => entry.game_id);
  const trending =
    popularIds.length > 0
      ? (
          await igdb<IgdbResult[]>(
            'games',
            `fields ${RESULT_FIELDS}; where ${[...base, ...onPlatforms, `game_type = ${FULL_GAMES}`, `first_release_date > ${now - 365 * DAY}`, `id = ${list(popularIds)}`].join(' & ')}; limit 50;`,
          )
        ).sort((a, b) => popularIds.indexOf(a.id) - popularIds.indexOf(b.id))
      : [];

  const top = named('top');
  const pools = [
    trending.map((game) => ({ game, tag: featuredTag(game, now, 'Trending') })),
    named('upcoming').map((game) => ({ game, tag: featuredTag(game, now, 'Coming soon') })),
    named('recent').map((game) => ({ game, tag: 'New this month' })),
    top.map((game) => ({ game, tag: 'Top rated' })),
  ];
  const featured = named('wishlist')
    .filter((game) => game.cover)
    .slice(0, WISHLIST_LIMIT)
    .map((game) => ({ game, tag: featuredTag(game, now, 'On your wishlist') }));
  const seen = new Set(featured.map((card) => card.game.id));
  for (let round = 0; featured.length < FEATURED_LIMIT && pools.some((pool) => pool.length > round); round += 1) {
    for (const pool of pools) {
      const card = pool[round];
      if (card && !seen.has(card.game.id) && featured.length < FEATURED_LIMIT) {
        seen.add(card.game.id);
        featured.push(card);
      }
    }
  }

  const franchiseName = (game: IgdbResult) =>
    game.franchises?.find((franchise) => input.franchiseIds.includes(franchise.id))?.name ??
    game.collections?.find((collection) => input.collectionIds.includes(collection.id))?.name ??
    null;

  const similar = named('similar').sort((a, b) => input.similarIds.indexOf(a.id) - input.similarIds.indexOf(b.id));

  return {
    featured: featured.map((card) => ({ tag: card.tag, game: toResult(card.game) })),
    similar: similar.map(toResult),
    franchise: named('franchise').map((game) => ({ ...toResult(game), franchise: franchiseName(game) })),
    topRated: top.map((game) => ({
      ...toResult(game),
      rating: game.aggregated_rating ? Math.round(game.aggregated_rating) : null,
    })),
  };
};

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Use POST' }, { status: 405 });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    try {
      return Response.json(await discover(readInput(body)));
    } catch (error) {
      if (error instanceof IgdbError) {
        return Response.json({ error: error.message }, { status: 502 });
      }
      return Response.json({ error: error instanceof Error ? error.message : 'Discover failed' }, { status: 500 });
    }
  }),
};
