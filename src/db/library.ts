import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import type { ActivityStatus, CompletionTier, GameDetail, LibraryGame } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';
import type { CatalogGame } from '@/lib/catalog';

const libraryTables = ['games', 'copies'] as const;

const fetchLibrary = (db: SQLiteDatabase) =>
  db.getAllAsync<LibraryGame>(`
    SELECT
      g.id,
      g.igdb_id AS igdbId,
      g.title,
      g.cover_image_id AS coverImageId,
      g.activity_status AS activityStatus,
      g.completion_tier AS completionTier,
      (
        SELECT GROUP_CONCAT(short_name, ' · ')
        FROM (
          SELECT DISTINCT p.short_name, p.sort_order
          FROM copies c
          JOIN platforms p ON p.id = c.platform_id
          WHERE c.game_id = g.id AND c.deleted_at IS NULL
          ORDER BY p.sort_order
        )
      ) AS platforms
    FROM games g
    WHERE g.deleted_at IS NULL
    ORDER BY
      CASE g.activity_status WHEN 'playing' THEN 0 WHEN 'backlog' THEN 1 WHEN 'wishlist' THEN 2 ELSE 3 END,
      g.title COLLATE NOCASE
  `);

export const useLibrary = () => useLiveQuery(fetchLibrary, libraryTables);

export const addCatalogGame = async (
  db: SQLiteDatabase,
  game: CatalogGame,
  status: ActivityStatus,
  platformIds: string[],
) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM games WHERE igdb_id = ?', game.id);
    const gameId = existing?.id ?? randomUUID();
    if (existing) {
      await db.runAsync(
        'UPDATE games SET title = ?, cover_image_id = ?, release_year = ?, activity_status = ?, completion_tier = CASE WHEN deleted_at IS NULL THEN completion_tier END, updated_at = ?, deleted_at = NULL WHERE id = ?',
        game.name,
        game.coverId,
        game.releaseYear,
        status,
        now,
        gameId,
      );
      await db.runAsync(
        'UPDATE copies SET deleted_at = ?, updated_at = ? WHERE game_id = ? AND deleted_at IS NULL',
        now,
        now,
        gameId,
      );
    } else {
      await db.runAsync(
        'INSERT INTO games (id, igdb_id, title, cover_image_id, release_year, activity_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        gameId,
        game.id,
        game.name,
        game.coverId,
        game.releaseYear,
        status,
        now,
        now,
      );
    }
    for (const platformId of platformIds) {
      await db.runAsync(
        'INSERT INTO copies (id, game_id, platform_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        randomUUID(),
        gameId,
        platformId,
        now,
        now,
      );
    }
  });
};

const fetchGame = async (db: SQLiteDatabase, id: string): Promise<GameDetail | null> => {
  const game = await db.getFirstAsync<Omit<GameDetail, 'platformIds' | 'canMaster'>>(
    `SELECT
      id,
      igdb_id AS igdbId,
      title,
      cover_image_id AS coverImageId,
      release_year AS releaseYear,
      activity_status AS activityStatus,
      completion_tier AS completionTier
    FROM games
    WHERE id = ? AND deleted_at IS NULL`,
    id,
  );
  if (!game) {
    return null;
  }
  const copies = await db.getAllAsync<{ platformId: string; hasAchievements: number }>(
    `SELECT DISTINCT c.platform_id AS platformId, p.has_achievements AS hasAchievements
    FROM copies c
    JOIN platforms p ON p.id = c.platform_id
    WHERE c.game_id = ? AND c.deleted_at IS NULL`,
    id,
  );
  return {
    ...game,
    platformIds: copies.map((copy) => copy.platformId),
    canMaster: copies.length === 0 || copies.some((copy) => copy.hasAchievements === 1),
  };
};

export const useGame = (id: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchGame(db, id), [id]);
  return useLiveQuery(query, libraryTables);
};

export const setActivityStatus = (db: SQLiteDatabase, id: string, status: ActivityStatus) =>
  db.runAsync(
    'UPDATE games SET activity_status = ?, updated_at = ? WHERE id = ?',
    status,
    new Date().toISOString(),
    id,
  );

export const setCompletionTier = (db: SQLiteDatabase, id: string, tier: CompletionTier | null) =>
  db.runAsync('UPDATE games SET completion_tier = ?, updated_at = ? WHERE id = ?', tier, new Date().toISOString(), id);

export const setPlatformOwned = async (db: SQLiteDatabase, gameId: string, platformId: string, owned: boolean) => {
  const now = new Date().toISOString();
  if (owned) {
    await db.runAsync(
      'INSERT INTO copies (id, game_id, platform_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      randomUUID(),
      gameId,
      platformId,
      now,
      now,
    );
    return;
  }
  await db.runAsync(
    'UPDATE copies SET deleted_at = ?, updated_at = ? WHERE game_id = ? AND platform_id = ? AND deleted_at IS NULL',
    now,
    now,
    gameId,
    platformId,
  );
};

export const removeGame = async (db: SQLiteDatabase, id: string) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE copies SET deleted_at = ?, updated_at = ? WHERE game_id = ? AND deleted_at IS NULL',
      now,
      now,
      id,
    );
    await db.runAsync('UPDATE games SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
  });
};
