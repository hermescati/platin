import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

interface IgdbGame {
  id: number;
  name: string;
  slug?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  platforms?: { abbreviation?: string; name: string }[];
  total_rating?: number;
  total_rating_count?: number;
}

interface CachedToken {
  value: string;
  expiresAt: number;
}

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const GAMES_URL = 'https://api.igdb.com/v4/games';
const RESULT_LIMIT = 20;
const MIN_QUERY = 2;
const MAX_QUERY = 100;
const TOKEN_MARGIN_MS = 60_000;

let cachedToken: CachedToken | null = null;

const credentials = () => {
  const clientId = Deno.env.get('IGDB_CLIENT_ID');
  const clientSecret = Deno.env.get('IGDB_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('IGDB credentials are not configured');
  }
  return { clientId, clientSecret };
};

const accessToken = async (clientId: string, clientSecret: string) => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const response = await fetch(`${TOKEN_URL}?${params}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Twitch token request failed with ${response.status}`);
  }
  const { access_token, expires_in } = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: access_token, expiresAt: Date.now() + expires_in * 1000 - TOKEN_MARGIN_MS };
  return access_token;
};

const searchBody = (query: string) => {
  const escaped = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [
    `search "${escaped}";`,
    'fields name, slug, cover.image_id, first_release_date, platforms.abbreviation, platforms.name, total_rating, total_rating_count;',
    'where version_parent = null;',
    `limit ${RESULT_LIMIT};`,
  ].join(' ');
};

const toResult = (game: IgdbGame) => ({
  id: game.id,
  name: game.name,
  slug: game.slug ?? null,
  coverId: game.cover?.image_id ?? null,
  releaseYear: game.first_release_date ? new Date(game.first_release_date * 1000).getUTCFullYear() : null,
  platforms: (game.platforms ?? []).map((platform) => platform.abbreviation ?? platform.name),
  rating: game.total_rating ? Math.round(game.total_rating) : null,
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
      const { clientId, clientSecret } = credentials();
      const token = await accessToken(clientId, clientSecret);
      const response = await fetch(GAMES_URL, {
        method: 'POST',
        headers: { 'Client-ID': clientId, Authorization: `Bearer ${token}` },
        body: searchBody(query),
      });
      if (response.status === 401) {
        cachedToken = null;
      }
      if (!response.ok) {
        return Response.json({ error: `IGDB request failed with ${response.status}` }, { status: 502 });
      }
      const games = (await response.json()) as IgdbGame[];
      const ranked = games
        .map((game, index) => ({ game, index }))
        .sort((a, b) => (b.game.total_rating_count ?? 0) - (a.game.total_rating_count ?? 0) || a.index - b.index)
        .map(({ game }) => toResult(game));
      return Response.json({ results: ranked });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : 'Search failed' }, { status: 500 });
    }
  }),
};
