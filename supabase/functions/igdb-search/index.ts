import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { RESULT_FIELDS, toResult, type IgdbResult } from '../_shared/catalog.ts';
import { igdb, IgdbError } from '../_shared/igdb.ts';

const RESULT_LIMIT = 20;
const MIN_QUERY = 2;
const MAX_QUERY = 100;

const searchBody = (query: string) => {
  const escaped = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [
    `search "${escaped}";`,
    `fields ${RESULT_FIELDS};`,
    'where version_parent = null;',
    `limit ${RESULT_LIMIT};`,
  ].join(' ');
};

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
      const games = await igdb<IgdbResult[]>('games', searchBody(query));
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
