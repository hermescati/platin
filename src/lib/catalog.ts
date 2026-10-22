export interface CatalogParent {
  id: number;
  name: string;
  coverId: string | null;
}

export interface CatalogGame {
  id: number;
  name: string;
  slug: string | null;
  coverId: string | null;
  releaseYear: number | null;
  platforms: string[];
  rating: number | null;
  type: string | null;
  parent: CatalogParent | null;
}

export const catalogMinQuery = 2;

const endpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/igdb-search`;
const apiKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const searchCatalog = async (query: string, signal?: AbortSignal): Promise<CatalogGame[]> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });
  const body = (await response.json()) as { results?: CatalogGame[]; error?: string };
  if (!response.ok || !body.results) {
    throw new Error(body.error ?? `Search failed with ${response.status}`);
  }
  return body.results;
};
