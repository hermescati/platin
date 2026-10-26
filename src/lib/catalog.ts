import type { CatalogRecord, PlatformRecord } from '@/db/types';

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
  releaseDate: number | null;
  releaseYear: number | null;
  platforms: string[];
  platformIds: number[];
  rating: number | null;
  type: string | null;
  parent: CatalogParent | null;
}

export const catalogMinQuery = 2;

const functionsUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;
const apiKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

const callFunction = async <T>(name: string, payload: unknown, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${functionsUrl}/${name}`, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? `${name} failed with ${response.status}`);
  }
  return body;
};

export const searchCatalog = async (query: string, signal?: AbortSignal) =>
  (await callFunction<{ results: CatalogGame[] }>('igdb-search', { query }, signal)).results;

export const fetchCatalogGames = async (ids: number[]) =>
  (await callFunction<{ games: CatalogRecord[] }>('igdb-game', { ids })).games;

export const fetchPlatforms = async () =>
  (await callFunction<{ platforms: PlatformRecord[] }>('igdb-platforms', {})).platforms;
