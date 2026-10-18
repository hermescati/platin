import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { ActivityStatus, LibraryGame } from '@/db/types';
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
        'UPDATE games SET title = ?, cover_image_id = ?, release_year = ?, activity_status = ?, updated_at = ?, deleted_at = NULL WHERE id = ?',
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
