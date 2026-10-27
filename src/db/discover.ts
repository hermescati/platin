import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { fetchUserPlatformIds } from '@/db/platforms';
import { useLiveQuery } from '@/db/useLiveQuery';
import { fetchDiscover, type DiscoverFeed, type DiscoverInput } from '@/lib/catalog';

export interface Discover {
  feed: DiscoverFeed;
  beatenTitle: string | null;
  platformIds: number[];
}

const discoverTables = ['discover_cache'] as const;
const refreshAfterMs = 12 * 60 * 60 * 1000;
const similarLimit = 20;

const ids = (rows: { id: number }[]) => rows.map((row) => row.id);

const fetchPlatformIds = async (db: SQLiteDatabase) => {
  const chosen = await fetchUserPlatformIds(db);
  if (chosen.length > 0) {
    return chosen;
  }
  return ids(
    await db.getAllAsync<{ id: number }>(
      `SELECT DISTINCT cp.platform_id AS id
      FROM copies cp
      JOIN library_games l ON l.id = cp.game_id
      WHERE cp.deleted_at IS NULL AND l.deleted_at IS NULL`,
    ),
  );
};

const fetchWishlistIds = async (db: SQLiteDatabase) =>
  ids(
    await db.getAllAsync<{ id: number }>(
      `SELECT l.igdb_id AS id
      FROM library_games l
      JOIN catalog_games c ON c.igdb_id = l.igdb_id
      WHERE l.deleted_at IS NULL AND l.status = 'wishlist'
        AND (c.release_date IS NULL OR c.release_date > CAST(strftime('%s', 'now') AS INTEGER))
      ORDER BY c.release_date IS NULL, c.release_date`,
    ),
  );

const fetchLastBeaten = (db: SQLiteDatabase) =>
  db.getFirstAsync<{ igdbId: number; title: string }>(
    `SELECT l.igdb_id AS igdbId, c.name AS title
    FROM library_games l
    JOIN catalog_games c ON c.igdb_id = l.igdb_id
    WHERE l.deleted_at IS NULL AND l.status = 'beaten' AND c.data IS NOT NULL
    ORDER BY COALESCE(l.main_story_at, l.updated_at) DESC
    LIMIT 1`,
  );

const fetchSimilarIds = async (db: SQLiteDatabase, igdbId: number) =>
  ids(
    await db.getAllAsync<{ id: number }>(
      `SELECT json_extract(item.value, '$.id') AS id
      FROM catalog_games c, json_each(c.data, '$.similar_games') AS item
      WHERE c.igdb_id = ?
      LIMIT ?`,
      igdbId,
      similarLimit,
    ),
  );

const fetchSeriesIds = async (db: SQLiteDatabase, path: '$.franchises' | '$.collections') =>
  ids(
    await db.getAllAsync<{ id: number }>(
      `SELECT DISTINCT json_extract(item.value, '$.id') AS id
      FROM library_games l
      JOIN catalog_games c ON c.igdb_id = l.igdb_id, json_each(c.data, ?) AS item
      WHERE l.deleted_at IS NULL AND l.status != 'wishlist'`,
      path,
    ),
  );

const buildInput = async (db: SQLiteDatabase) => {
  const beaten = await fetchLastBeaten(db);
  const [platformIds, wishlistIds, similarIds, franchiseIds, collectionIds] = await Promise.all([
    fetchPlatformIds(db),
    fetchWishlistIds(db),
    beaten ? fetchSimilarIds(db, beaten.igdbId) : Promise.resolve([]),
    fetchSeriesIds(db, '$.franchises'),
    fetchSeriesIds(db, '$.collections'),
  ]);
  const input: DiscoverInput = { platformIds, wishlistIds, similarIds, franchiseIds, collectionIds };
  return { input, beatenTitle: similarIds.length > 0 ? (beaten?.title ?? null) : null };
};

const fetchCached = async (db: SQLiteDatabase): Promise<Discover | null> => {
  const row = await db.getFirstAsync<{ input: string; beatenTitle: string | null; data: string }>(
    'SELECT input, beaten_title AS beatenTitle, data FROM discover_cache WHERE id = 1',
  );
  if (!row) {
    return null;
  }
  const input = JSON.parse(row.input) as DiscoverInput;
  return { feed: JSON.parse(row.data) as DiscoverFeed, beatenTitle: row.beatenTitle, platformIds: input.platformIds };
};

const isFresh = async (db: SQLiteDatabase, input: string) => {
  const row = await db.getFirstAsync<{ input: string; fetchedAt: string }>(
    'SELECT input, fetched_at AS fetchedAt FROM discover_cache WHERE id = 1',
  );
  return !!row && row.input === input && Date.now() - Date.parse(row.fetchedAt) < refreshAfterMs;
};

const refreshDiscover = async (db: SQLiteDatabase) => {
  const { input, beatenTitle } = await buildInput(db);
  const key = JSON.stringify(input);
  if (await isFresh(db, key)) {
    return;
  }
  const feed = await fetchDiscover(input);
  await db.runAsync(
    `INSERT INTO discover_cache (id, input, beaten_title, data, fetched_at) VALUES (1, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      input = excluded.input,
      beaten_title = excluded.beaten_title,
      data = excluded.data,
      fetched_at = excluded.fetched_at`,
    key,
    beatenTitle,
    JSON.stringify(feed),
    new Date().toISOString(),
  );
};

export const useDiscover = () => {
  const db = useSQLiteContext();
  const discover = useLiveQuery(fetchCached, discoverTables);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    refreshDiscover(db)
      .then(() => active && setFailed(false))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [db, attempt]);

  const retry = () => setAttempt((value) => value + 1);

  return { discover, failed, retry };
};
