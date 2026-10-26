import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { refreshCatalog, saveSearchResult } from '@/db/catalog';
import { hasAchievements, knownPlatformIds } from '@/db/platforms';
import { gameMinutesSql } from '@/db/sessions';
import type { GameDetail, GameStatus, LibraryGame, Platform, RemovedGame, Tier } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';
import type { CatalogGame } from '@/lib/catalog';

const libraryTables = ['library_games', 'catalog_games', 'copies'] as const;

const restoreWindowMs = 30 * 24 * 60 * 60 * 1000;

const addonTypes = ['DLC', 'Expansion', 'Pack', 'Season', 'Episode', 'Update'];

const tierColumns: Record<Tier, { at: string; minutes: string }> = {
  main_story: { at: 'main_story_at', minutes: 'main_story_minutes' },
  completionist: { at: 'completionist_at', minutes: 'completionist_minutes' },
  platinum: { at: 'platinum_at', minutes: 'platinum_minutes' },
};

const fetchLibrary = (db: SQLiteDatabase) =>
  db.getAllAsync<LibraryGame>(`
    SELECT
      l.id,
      l.igdb_id AS igdbId,
      c.name AS title,
      c.cover_image_id AS coverImageId,
      CAST(strftime('%Y', c.release_date, 'unixepoch') AS INTEGER) AS releaseYear,
      c.game_type AS gameType,
      l.status,
      l.tier,
      (
        SELECT GROUP_CONCAT(short_name, ' · ')
        FROM (
          SELECT DISTINCT COALESCE(p.abbreviation, p.name) AS short_name, p.generation, p.name
          FROM copies cp
          JOIN platforms p ON p.igdb_id = cp.platform_id
          WHERE cp.game_id = l.id AND cp.deleted_at IS NULL
          ORDER BY p.generation IS NULL, p.generation DESC, p.name
        )
      ) AS platforms
    FROM library_games l
    JOIN catalog_games c ON c.igdb_id = l.igdb_id
    WHERE l.deleted_at IS NULL AND (l.parent_id IS NULL OR l.plays_on_its_own = 1)
    ORDER BY
      CASE l.status WHEN 'playing' THEN 0 WHEN 'backlog' THEN 1 WHEN 'wishlist' THEN 2 ELSE 3 END,
      c.name COLLATE NOCASE
  `);

export const useLibrary = () => useLiveQuery(fetchLibrary, libraryTables);

const findParentId = async (db: SQLiteDatabase, game: CatalogGame) => {
  if (!game.parent || !game.type || !addonTypes.includes(game.type)) {
    return null;
  }
  const parent = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM library_games WHERE igdb_id = ? AND deleted_at IS NULL',
    game.parent.id,
  );
  return parent?.id ?? null;
};

export const addCatalogGame = async (
  db: SQLiteDatabase,
  game: CatalogGame,
  status: GameStatus,
  platformIds: number[],
) => {
  const now = new Date().toISOString();
  const tier: Tier | null = status === 'beaten' ? 'main_story' : null;
  const reachedAt = tier ? now : null;
  await db.withTransactionAsync(async () => {
    await saveSearchResult(db, game);
    const parentId = await findParentId(db, game);
    const removed = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM library_games WHERE igdb_id = ? AND deleted_at IS NOT NULL',
      game.id,
    );
    if (removed) {
      await forgetGame(db, removed.id);
    }
    const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM library_games WHERE igdb_id = ?', game.id);
    const gameId = existing?.id ?? randomUUID();
    if (existing) {
      const beaten = status === 'beaten' ? 1 : 0;
      await db.runAsync(
        `UPDATE library_games SET
          status = ?,
          tier = CASE WHEN ? THEN COALESCE(tier, 'main_story') ELSE tier END,
          main_story_at = CASE WHEN ? AND tier IS NULL THEN ? ELSE main_story_at END,
          main_story_minutes = CASE WHEN ? AND tier IS NULL THEN ${gameMinutesSql} ELSE main_story_minutes END,
          parent_id = COALESCE(parent_id, ?),
          updated_at = ?
        WHERE id = ?`,
        status,
        beaten,
        beaten,
        now,
        beaten,
        parentId,
        now,
        gameId,
      );
    } else {
      await db.runAsync(
        `INSERT INTO library_games (id, igdb_id, status, tier, main_story_at, parent_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        gameId,
        game.id,
        status,
        tier,
        reachedAt,
        parentId,
        now,
        now,
      );
    }
    const existingCopies = await db.getAllAsync<{ platformId: number }>(
      'SELECT platform_id AS platformId FROM copies WHERE game_id = ? AND deleted_at IS NULL',
      gameId,
    );
    const owned = existingCopies.map((copy) => copy.platformId);
    const newPlatformIds = (await knownPlatformIds(db, platformIds)).filter((id) => !owned.includes(id));
    for (const platformId of newPlatformIds) {
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
  refreshCatalog(db, [game.id]);
};

const fetchGame = async (db: SQLiteDatabase, id: string): Promise<GameDetail | null> => {
  const game = await db.getFirstAsync<
    Omit<GameDetail, 'platformIds' | 'canEarnPlatinum' | 'hasEnding'> & { hasEnding: number }
  >(
    `SELECT
      l.id,
      l.igdb_id AS igdbId,
      c.name AS title,
      c.cover_image_id AS coverImageId,
      CAST(strftime('%Y', c.release_date, 'unixepoch') AS INTEGER) AS releaseYear,
      c.developer,
      c.has_ending AS hasEnding,
      l.status,
      l.tier
    FROM library_games l
    JOIN catalog_games c ON c.igdb_id = l.igdb_id
    WHERE l.id = ? AND l.deleted_at IS NULL`,
    id,
  );
  if (!game) {
    return null;
  }
  const copies = await db.getAllAsync<Pick<Platform, 'id' | 'family' | 'generation'>>(
    `SELECT DISTINCT p.igdb_id AS id, p.family, p.generation
    FROM copies c
    JOIN platforms p ON p.igdb_id = c.platform_id
    WHERE c.game_id = ? AND c.deleted_at IS NULL`,
    id,
  );
  return {
    ...game,
    hasEnding: game.hasEnding === 1,
    platformIds: copies.map((copy) => copy.id),
    canEarnPlatinum: copies.length === 0 || copies.some(hasAchievements),
  };
};

export const useGame = (id: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchGame(db, id), [id]);
  return useLiveQuery(query, libraryTables);
};

export const setStatus = (db: SQLiteDatabase, id: string, status: GameStatus) => {
  const now = new Date().toISOString();
  const beaten = status === 'beaten' ? 1 : 0;
  return db.runAsync(
    `UPDATE library_games SET
      status = ?,
      tier = CASE WHEN ? THEN COALESCE(tier, 'main_story') ELSE tier END,
      main_story_at = CASE WHEN ? AND tier IS NULL THEN ? ELSE main_story_at END,
      main_story_minutes = CASE WHEN ? AND tier IS NULL THEN ${gameMinutesSql} ELSE main_story_minutes END,
      updated_at = ?
    WHERE id = ?`,
    status,
    beaten,
    beaten,
    now,
    beaten,
    now,
    id,
  );
};

export const setTier = (db: SQLiteDatabase, id: string, tier: Tier | null) => {
  const now = new Date().toISOString();
  if (!tier) {
    return db.runAsync(
      "UPDATE library_games SET tier = NULL, updated_at = ? WHERE id = ? AND status != 'beaten'",
      now,
      id,
    );
  }
  const { at, minutes } = tierColumns[tier];
  return db.runAsync(
    `UPDATE library_games SET
      tier = ?,
      ${minutes} = CASE WHEN ${at} IS NULL THEN ${gameMinutesSql} ELSE ${minutes} END,
      ${at} = COALESCE(${at}, ?),
      updated_at = ?
    WHERE id = ?`,
    tier,
    now,
    now,
    id,
  );
};

export const setPlatformOwned = async (db: SQLiteDatabase, gameId: string, platformId: number, owned: boolean) => {
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

const addonsOf = `
  SELECT id FROM library_games
  WHERE parent_id = ? AND COALESCE(plays_on_its_own, 0) = 0`;

export const removeGame = async (db: SQLiteDatabase, id: string) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE copies SET deleted_at = ?, updated_at = ?
      WHERE (game_id = ? OR game_id IN (${addonsOf} AND deleted_at IS NULL)) AND deleted_at IS NULL`,
      now,
      now,
      id,
      id,
    );
    await db.runAsync(
      `UPDATE library_games SET deleted_at = ?, updated_at = ?
      WHERE (id = ? OR id IN (${addonsOf})) AND deleted_at IS NULL`,
      now,
      now,
      id,
      id,
    );
  });
};

const forgetGame = async (db: SQLiteDatabase, id: string) => {
  await db.runAsync(
    `DELETE FROM library_games WHERE id IN (${addonsOf} AND deleted_at = (SELECT deleted_at FROM library_games WHERE id = ?))`,
    id,
    id,
  );
  await db.runAsync('UPDATE library_games SET parent_id = NULL WHERE parent_id = ?', id);
  await db.runAsync('DELETE FROM library_games WHERE id = ?', id);
};

export const findRemovedGame = (db: SQLiteDatabase, igdbId: number) =>
  db.getFirstAsync<RemovedGame>(
    `SELECT
      l.id,
      l.tier,
      COALESCE((
        SELECT SUM(s.minutes)
        FROM play_sessions s
        JOIN copies c ON c.id = s.copy_id
        WHERE c.game_id = l.id AND c.deleted_at = l.deleted_at AND s.deleted_at IS NULL
      ), 0) AS totalMinutes,
      (
        SELECT GROUP_CONCAT(COALESCE(p.abbreviation, p.name), ', ')
        FROM copies c
        JOIN platforms p ON p.igdb_id = c.platform_id
        WHERE c.game_id = l.id AND c.deleted_at = l.deleted_at
      ) AS platforms,
      (
        SELECT COUNT(*)
        FROM library_games a
        WHERE a.parent_id = l.id AND a.deleted_at = l.deleted_at AND COALESCE(a.plays_on_its_own, 0) = 0
      ) AS addons
    FROM library_games l
    WHERE l.igdb_id = ? AND l.deleted_at IS NOT NULL AND l.deleted_at >= ?`,
    igdbId,
    new Date(Date.now() - restoreWindowMs).toISOString(),
  );

export const restoreGame = async (db: SQLiteDatabase, id: string) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const removedAt = `(SELECT deleted_at FROM library_games WHERE id = ?)`;
    await db.runAsync(
      `UPDATE copies SET deleted_at = NULL, updated_at = ?
      WHERE (game_id = ? OR game_id IN (${addonsOf})) AND deleted_at = ${removedAt}`,
      now,
      id,
      id,
      id,
    );
    await db.runAsync(
      `UPDATE library_games SET deleted_at = NULL, updated_at = ?
      WHERE id IN (${addonsOf} AND deleted_at = ${removedAt})`,
      now,
      id,
      id,
    );
    await db.runAsync('UPDATE library_games SET deleted_at = NULL, updated_at = ? WHERE id = ?', now, id);
  });
};

export const purgeRemovedGames = async (db: SQLiteDatabase) => {
  const cutoff = new Date(Date.now() - restoreWindowMs).toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE library_games SET parent_id = NULL WHERE parent_id IN (SELECT id FROM library_games WHERE deleted_at < ?)',
      cutoff,
    );
    await db.runAsync('DELETE FROM library_games WHERE deleted_at < ?', cutoff);
    await db.runAsync('DELETE FROM copies WHERE deleted_at < ?', cutoff);
    await db.runAsync('DELETE FROM play_sessions WHERE deleted_at < ?', cutoff);
  });
};
