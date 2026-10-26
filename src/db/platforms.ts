import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import type { Platform, PlatformRecord } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';
import { fetchPlatforms } from '@/lib/catalog';

const refreshAfterMs = 7 * 24 * 60 * 60 * 1000;
const computerPlatforms = [6, 3, 14];
const playStationPortable = 38;
const firstAchievementGeneration = 7;

let refreshing: Promise<void> | null = null;

const platformTables = ['platforms', 'user_platforms', 'copies', 'catalog_games'] as const;

const platformColumns = `
  p.igdb_id AS id,
  p.name,
  COALESCE(p.abbreviation, p.name) AS shortName,
  p.family,
  p.generation`;

const platformOrder = 'p.generation IS NULL, p.generation DESC, p.name';

export const hasAchievements = (platform: Pick<Platform, 'id' | 'family' | 'generation'>) => {
  if (computerPlatforms.includes(platform.id)) {
    return true;
  }
  if (platform.id === playStationPortable || (platform.generation ?? 0) < firstAchievementGeneration) {
    return false;
  }
  return platform.family === 'PlayStation' || platform.family === 'Xbox';
};

const saveRecords = async (db: SQLiteDatabase, records: PlatformRecord[]) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const record of records) {
      await db.runAsync(
        `INSERT INTO platforms (
          igdb_id, name, abbreviation, slug, generation, family, type, logo_image_id, igdb_updated_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (igdb_id) DO UPDATE SET
          name = excluded.name,
          abbreviation = excluded.abbreviation,
          slug = excluded.slug,
          generation = excluded.generation,
          family = excluded.family,
          type = excluded.type,
          logo_image_id = excluded.logo_image_id,
          igdb_updated_at = excluded.igdb_updated_at,
          fetched_at = excluded.fetched_at`,
        record.igdbId,
        record.name,
        record.abbreviation,
        record.slug,
        record.generation,
        record.family,
        record.type,
        record.logoImageId,
        record.igdbUpdatedAt,
        now,
      );
    }
  });
};

const needsRefresh = async (db: SQLiteDatabase) => {
  const cutoff = new Date(Date.now() - refreshAfterMs).toISOString();
  const stale = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM platforms WHERE fetched_at IS NULL OR fetched_at < ?',
    cutoff,
  );
  return (stale?.count ?? 0) > 0;
};

export const refreshPlatforms = (db: SQLiteDatabase) => {
  refreshing ??= (async () => {
    if (await needsRefresh(db)) {
      await saveRecords(db, await fetchPlatforms());
    }
  })()
    .catch(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

export const knownPlatformIds = async (db: SQLiteDatabase, ids: number[]) => {
  if (ids.length === 0) {
    return [];
  }
  const rows = await db.getAllAsync<{ id: number }>(
    `SELECT igdb_id AS id FROM platforms WHERE igdb_id IN (${ids.map(() => '?').join(', ')})`,
    ...ids,
  );
  return rows.map((row) => row.id);
};

export const fetchPlatformsByIds = async (db: SQLiteDatabase, ids: number[]) => {
  if (ids.length === 0) {
    return [];
  }
  return db.getAllAsync<Platform>(
    `SELECT ${platformColumns}
    FROM platforms p
    WHERE p.igdb_id IN (${ids.map(() => '?').join(', ')})
    ORDER BY ${platformOrder}`,
    ...ids,
  );
};

export const usePlatformsByIds = (ids: number[]) => {
  const key = ids.join(',');
  const query = useCallback(
    (db: SQLiteDatabase) => fetchPlatformsByIds(db, key ? key.split(',').map(Number) : []),
    [key],
  );
  return useLiveQuery(query, platformTables);
};

const fetchGamePlatforms = (db: SQLiteDatabase, gameId: string) =>
  db.getAllAsync<Platform>(
    `SELECT ${platformColumns}
    FROM platforms p
    WHERE p.igdb_id IN (
      SELECT json_extract(item.value, '$.id')
      FROM library_games l
      JOIN catalog_games c ON c.igdb_id = l.igdb_id, json_each(c.data, '$.platforms') AS item
      WHERE l.id = ?
    )
    OR p.igdb_id IN (SELECT platform_id FROM copies WHERE game_id = ? AND deleted_at IS NULL)
    ORDER BY ${platformOrder}`,
    gameId,
    gameId,
  );

export const useGamePlatforms = (gameId: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchGamePlatforms(db, gameId), [gameId]);
  return useLiveQuery(query, platformTables);
};

export const fetchUserPlatformIds = async (db: SQLiteDatabase) => {
  const rows = await db.getAllAsync<{ id: number }>(
    'SELECT platform_id AS id FROM user_platforms WHERE deleted_at IS NULL',
  );
  return rows.map((row) => row.id);
};

export const useUserPlatformIds = () => useLiveQuery(fetchUserPlatformIds, platformTables);
