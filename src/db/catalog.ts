import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { refreshPlatforms } from '@/db/platforms';
import type { CatalogRecord } from '@/db/types';
import { fetchCatalogGames, type CatalogGame } from '@/lib/catalog';

const refreshAfterMs = 24 * 60 * 60 * 1000;
const batchSize = 100;

let refreshing: Promise<void> | null = null;

export const saveSearchResult = (db: SQLiteDatabase, game: CatalogGame) =>
  db.runAsync(
    `INSERT INTO catalog_games (igdb_id, name, slug, cover_image_id, release_date, game_type, parent_igdb_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (igdb_id) DO NOTHING`,
    game.id,
    game.name,
    game.slug,
    game.coverId,
    game.releaseDate,
    game.type,
    game.parent?.id ?? null,
  );

const saveRecords = async (db: SQLiteDatabase, records: CatalogRecord[]) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const record of records) {
      await db.runAsync(
        `INSERT INTO catalog_games (
          igdb_id, name, slug, cover_image_id, release_date, game_type, parent_igdb_id, developer,
          critic_score, critic_count, main_story_seconds, completionist_seconds, has_ending,
          data, igdb_updated_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (igdb_id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          cover_image_id = excluded.cover_image_id,
          release_date = excluded.release_date,
          game_type = excluded.game_type,
          parent_igdb_id = excluded.parent_igdb_id,
          developer = excluded.developer,
          critic_score = excluded.critic_score,
          critic_count = excluded.critic_count,
          main_story_seconds = excluded.main_story_seconds,
          completionist_seconds = excluded.completionist_seconds,
          has_ending = excluded.has_ending,
          data = excluded.data,
          igdb_updated_at = excluded.igdb_updated_at,
          fetched_at = excluded.fetched_at`,
        record.igdbId,
        record.name,
        record.slug,
        record.coverImageId,
        record.releaseDate,
        record.gameType,
        record.parentIgdbId,
        record.developer,
        record.criticScore,
        record.criticCount,
        record.mainStorySeconds,
        record.completionistSeconds,
        record.hasEnding ? 1 : 0,
        JSON.stringify(record.data),
        record.igdbUpdatedAt,
        now,
      );
    }
  });
};

const staleLibraryIds = async (db: SQLiteDatabase) => {
  const cutoff = new Date(Date.now() - refreshAfterMs).toISOString();
  const rows = await db.getAllAsync<{ igdbId: number }>(
    `SELECT c.igdb_id AS igdbId
    FROM library_games l
    JOIN catalog_games c ON c.igdb_id = l.igdb_id
    WHERE l.deleted_at IS NULL AND (c.fetched_at IS NULL OR c.fetched_at < ?)`,
    cutoff,
  );
  return rows.map((row) => row.igdbId);
};

const fetchAndSave = async (db: SQLiteDatabase, ids: number[]) => {
  for (let start = 0; start < ids.length; start += batchSize) {
    await saveRecords(db, await fetchCatalogGames(ids.slice(start, start + batchSize)));
  }
};

export const refreshCatalog = (db: SQLiteDatabase, ids?: number[]) => {
  if (!ids && refreshing) {
    return refreshing;
  }
  const run = (async () => fetchAndSave(db, ids ?? (await staleLibraryIds(db))))().catch(() => undefined);
  if (!ids) {
    refreshing = run.finally(() => {
      refreshing = null;
    });
    return refreshing;
  }
  return run;
};

export const useCatalogRefresh = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    const refresh = () => {
      refreshPlatforms(db);
      refreshCatalog(db);
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [db]);
};
