import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { runForNewSession } from '@/db/runs';
import type { Playtime } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';

const sessionTables = ['play_sessions', 'copies', 'platforms'] as const;

export const gameMinutesSql = `(
  SELECT SUM(s.minutes)
  FROM play_sessions s
  JOIN copies c ON c.id = s.copy_id
  WHERE c.game_id = library_games.id AND s.deleted_at IS NULL AND c.deleted_at IS NULL
)`;

export const addSession = async (db: SQLiteDatabase, copyId: string, playedOn: string, minutes: number) => {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const runId = await runForNewSession(db, copyId, playedOn);
    await db.runAsync(
      'INSERT INTO play_sessions (id, copy_id, run_id, played_on, minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      randomUUID(),
      copyId,
      runId,
      playedOn,
      minutes,
      now,
      now,
    );
    await db.runAsync(
      `UPDATE library_games SET
        last_played_at = MAX(COALESCE(last_played_at, ''), ?),
        updated_at = ?
      WHERE id = (SELECT game_id FROM copies WHERE id = ?)`,
      playedOn,
      now,
      copyId,
    );
  });
};

export const removeSession = (db: SQLiteDatabase, id: string) => {
  const now = new Date().toISOString();
  return db.runAsync('UPDATE play_sessions SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
};

const fetchPlaytime = async (db: SQLiteDatabase, gameId: string): Promise<Playtime> => {
  const platforms = await db.getAllAsync<Playtime['platforms'][number]>(
    `SELECT
      p.igdb_id AS id,
      COALESCE(p.abbreviation, p.name) AS shortName,
      SUM(s.minutes) AS minutes
    FROM play_sessions s
    JOIN copies c ON c.id = s.copy_id
    JOIN platforms p ON p.igdb_id = c.platform_id
    WHERE c.game_id = ? AND s.deleted_at IS NULL AND c.deleted_at IS NULL
    GROUP BY p.igdb_id
    ORDER BY minutes DESC`,
    gameId,
  );
  return {
    totalMinutes: platforms.reduce((total, platform) => total + platform.minutes, 0),
    platforms,
  };
};

export const usePlaytime = (gameId: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchPlaytime(db, gameId), [gameId]);
  return useLiveQuery(query, sessionTables);
};
