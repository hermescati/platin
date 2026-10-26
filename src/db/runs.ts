import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import type { NewRun, Run } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';

const runTables = ['runs', 'run_attempts', 'play_sessions', 'copies', 'platforms'] as const;

const firstPlaythroughName = 'First playthrough';

const openRunSql = `
  SELECT id FROM runs
  WHERE copy_id = ? AND type != 'speedrun' AND finished_at IS NULL AND gave_up_at IS NULL AND deleted_at IS NULL`;

export const findOpenRun = async (db: SQLiteDatabase, copyId: string) =>
  (await db.getFirstAsync<{ id: string }>(openRunSql, copyId))?.id ?? null;

const insertRun = async (db: SQLiteDatabase, run: NewRun, startedAt: string) => {
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.runAsync(
    `INSERT INTO runs (id, copy_id, type, name, rule, category, target_seconds, started_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    run.copyId,
    run.type,
    run.name,
    run.rule ?? null,
    run.category ?? null,
    run.targetSeconds ?? null,
    startedAt,
    now,
    now,
  );
  return id;
};

export const startRun = async (db: SQLiteDatabase, run: NewRun) => {
  if (run.type !== 'speedrun' && (await findOpenRun(db, run.copyId))) {
    return null;
  }
  return insertRun(db, run, new Date().toISOString());
};

export const runForNewSession = async (db: SQLiteDatabase, copyId: string, playedOn: string) => {
  const open = await findOpenRun(db, copyId);
  if (open) {
    return open;
  }
  const game = await db.getFirstAsync<{ hasEnding: number; runs: number }>(
    `SELECT
      cg.has_ending AS hasEnding,
      (
        SELECT COUNT(*)
        FROM runs r
        JOIN copies rc ON rc.id = r.copy_id
        WHERE rc.game_id = c.game_id AND r.deleted_at IS NULL
      ) AS runs
    FROM copies c
    JOIN library_games l ON l.id = c.game_id
    JOIN catalog_games cg ON cg.igdb_id = l.igdb_id
    WHERE c.id = ?`,
    copyId,
  );
  if (!game || game.hasEnding !== 1 || game.runs > 0) {
    return null;
  }
  return insertRun(db, { copyId, type: 'playthrough', name: firstPlaythroughName }, playedOn);
};

const endRun = (db: SQLiteDatabase, id: string, column: 'finished_at' | 'gave_up_at') => {
  const now = new Date().toISOString();
  return db.runAsync(
    `UPDATE runs SET ${column} = ?, updated_at = ?
    WHERE id = ? AND finished_at IS NULL AND gave_up_at IS NULL AND (type != 'speedrun' OR ? = 'gave_up_at')`,
    now,
    now,
    id,
    column,
  );
};

export const finishRun = (db: SQLiteDatabase, id: string) => endRun(db, id, 'finished_at');

export const giveUpRun = (db: SQLiteDatabase, id: string) => endRun(db, id, 'gave_up_at');

export const deleteRun = (db: SQLiteDatabase, id: string) => {
  const now = new Date().toISOString();
  return db.runAsync('UPDATE runs SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
};

export const addAttempt = (db: SQLiteDatabase, runId: string, attemptedOn: string, seconds: number) => {
  const now = new Date().toISOString();
  return db.runAsync(
    'INSERT INTO run_attempts (id, run_id, attempted_on, seconds, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    randomUUID(),
    runId,
    attemptedOn,
    seconds,
    now,
    now,
  );
};

const fetchRuns = (db: SQLiteDatabase, gameId: string) =>
  db.getAllAsync<Run>(
    `SELECT
      r.id,
      r.copy_id AS copyId,
      COALESCE(p.abbreviation, p.name) AS platform,
      r.type,
      r.name,
      r.rule,
      r.category,
      r.target_seconds AS targetSeconds,
      r.started_at AS startedAt,
      r.finished_at AS finishedAt,
      r.gave_up_at AS gaveUpAt,
      CASE
        WHEN r.finished_at IS NOT NULL THEN 'finished'
        WHEN r.gave_up_at IS NOT NULL THEN 'gave_up'
        ELSE 'open'
      END AS state,
      COALESCE((
        SELECT SUM(s.minutes) FROM play_sessions s WHERE s.run_id = r.id AND s.deleted_at IS NULL
      ), 0) AS minutes,
      (SELECT MIN(a.seconds) FROM run_attempts a WHERE a.run_id = r.id AND a.deleted_at IS NULL) AS bestSeconds,
      (SELECT COUNT(*) FROM run_attempts a WHERE a.run_id = r.id AND a.deleted_at IS NULL) AS attempts
    FROM runs r
    JOIN copies c ON c.id = r.copy_id
    JOIN platforms p ON p.igdb_id = c.platform_id
    WHERE c.game_id = ? AND c.deleted_at IS NULL AND r.deleted_at IS NULL
    ORDER BY r.finished_at IS NOT NULL OR r.gave_up_at IS NOT NULL, r.started_at DESC`,
    gameId,
  );

export const useRuns = (gameId: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchRuns(db, gameId), [gameId]);
  return useLiveQuery(query, runTables);
};
