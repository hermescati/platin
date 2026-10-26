interface CachedToken {
  value: string;
  expiresAt: number;
}

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const API_URL = 'https://api.igdb.com/v4';
const TOKEN_MARGIN_MS = 60_000;

let cachedToken: CachedToken | null = null;

export class IgdbError extends Error {}

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

export const igdb = async <T>(endpoint: string, body: string): Promise<T> => {
  const { clientId, clientSecret } = credentials();
  const token = await accessToken(clientId, clientSecret);
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Client-ID': clientId, Authorization: `Bearer ${token}` },
    body,
  });
  if (response.status === 401) {
    cachedToken = null;
  }
  if (!response.ok) {
    throw new IgdbError(`IGDB request failed with ${response.status}`);
  }
  return (await response.json()) as T;
};
