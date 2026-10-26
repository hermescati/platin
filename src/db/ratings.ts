import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import type { Rating, RatingScore, SetWeight } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';

interface SetMatch {
  fallback?: boolean;
  modes?: string[];
  genres?: string[];
  themes?: string[];
}

interface GameSignals {
  modes: string[];
  genres: string[];
  themes: string[];
  series: number[];
}

const ratingTables = ['ratings', 'rating_scores', 'rating_sets', 'rating_set_metrics', 'metrics'] as const;

const minMetrics = 3;
const maxMetrics = 8;

export const defaultSetWeights: Record<string, SetWeight[]> = {
  multiplayer: [
    { metricId: 'gameplay', weight: 35 },
    { metricId: 'online', weight: 25 },
    { metricId: 'performance', weight: 20 },
    { metricId: 'difficulty', weight: 20 },
  ],
  horror: [
    { metricId: 'visuals', weight: 35 },
    { metricId: 'audio', weight: 30 },
    { metricId: 'story', weight: 15 },
    { metricId: 'gameplay', weight: 15 },
    { metricId: 'performance', weight: 5 },
  ],
  story_world: [
    { metricId: 'story', weight: 25 },
    { metricId: 'gameplay', weight: 20 },
    { metricId: 'world', weight: 15 },
    { metricId: 'characters', weight: 10 },
    { metricId: 'visuals', weight: 10 },
    { metricId: 'audio', weight: 10 },
    { metricId: 'performance', weight: 10 },
  ],
  strategy_sim: [
    { metricId: 'gameplay', weight: 30 },
    { metricId: 'difficulty', weight: 20 },
    { metricId: 'controls', weight: 20 },
    { metricId: 'replay', weight: 20 },
    { metricId: 'performance', weight: 10 },
  ],
  racing_sports: [
    { metricId: 'controls', weight: 25 },
    { metricId: 'gameplay', weight: 20 },
    { metricId: 'online', weight: 15 },
    { metricId: 'visuals', weight: 10 },
    { metricId: 'audio', weight: 10 },
    { metricId: 'value', weight: 10 },
    { metricId: 'performance', weight: 10 },
  ],
  action: [
    { metricId: 'gameplay', weight: 30 },
    { metricId: 'controls', weight: 20 },
    { metricId: 'world', weight: 15 },
    { metricId: 'difficulty', weight: 15 },
    { metricId: 'audio', weight: 10 },
    { metricId: 'performance', weight: 10 },
  ],
  standard: [
    { metricId: 'gameplay', weight: 30 },
    { metricId: 'value', weight: 20 },
    { metricId: 'replay', weight: 15 },
    { metricId: 'visuals', weight: 15 },
    { metricId: 'audio', weight: 10 },
    { metricId: 'performance', weight: 10 },
  ],
};

const names = (value: unknown) =>
  Array.isArray(value) ? value.map((item: { name?: string }) => item.name).filter((name): name is string => !!name) : [];

const ids = (value: unknown) =>
  Array.isArray(value) ? value.map((item: { id?: number }) => item.id).filter((id): id is number => !!id) : [];

const gameSignals = async (db: SQLiteDatabase, gameId: string): Promise<GameSignals> => {
  const row = await db.getFirstAsync<{ data: string | null }>(
    'SELECT c.data FROM library_games l JOIN catalog_games c ON c.igdb_id = l.igdb_id WHERE l.id = ?',
    gameId,
  );
  const data = (row?.data ? JSON.parse(row.data) : {}) as Record<string, unknown>;
  return {
    modes: names(data.game_modes),
    genres: names(data.genres),
    themes: names(data.themes),
    series: [...ids(data.collections), ...ids(data.franchises)],
  };
};

const matches = (match: SetMatch, game: GameSignals) =>
  !!match.fallback ||
  !!match.modes?.some((mode) => game.modes.includes(mode)) ||
  !!match.genres?.some((genre) => game.genres.includes(genre)) ||
  !!match.themes?.some((theme) => game.themes.includes(theme));

export const pickSet = async (db: SQLiteDatabase, gameId: string) => {
  const game = await gameSignals(db, gameId);
  if (game.series.length > 0) {
    const chosen = await db.getFirstAsync<{ setId: string }>(
      `SELECT set_id AS setId FROM rating_series_sets
      WHERE deleted_at IS NULL AND series_igdb_id IN (${game.series.map(() => '?').join(', ')})`,
      ...game.series,
    );
    if (chosen) {
      return chosen.setId;
    }
  }
  const sets = await db.getAllAsync<{ id: string; match: string }>(
    'SELECT id, match FROM rating_sets WHERE deleted_at IS NULL AND match IS NOT NULL ORDER BY sort_order',
  );
  return sets.find((set) => matches(JSON.parse(set.match) as SetMatch, game))?.id ?? null;
};

const applySet = async (db: SQLiteDatabase, ratingId: string, setId: string) => {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE rating_scores SET weight = 0, updated_at = ?
    WHERE rating_id = ? AND metric_id NOT IN (
      SELECT metric_id FROM rating_set_metrics WHERE set_id = ? AND deleted_at IS NULL
    )`,
    now,
    ratingId,
    setId,
  );
  const weights = await db.getAllAsync<SetWeight>(
    'SELECT metric_id AS metricId, weight FROM rating_set_metrics WHERE set_id = ? AND deleted_at IS NULL',
    setId,
  );
  for (const { metricId, weight } of weights) {
    await db.runAsync(
      `INSERT INTO rating_scores (id, rating_id, metric_id, weight, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (rating_id, metric_id) DO UPDATE SET weight = excluded.weight, updated_at = excluded.updated_at`,
      randomUUID(),
      ratingId,
      metricId,
      weight,
      now,
      now,
    );
  }
  await db.runAsync('UPDATE ratings SET set_id = ?, updated_at = ? WHERE id = ?', setId, now, ratingId);
};

const ensureRating = async (db: SQLiteDatabase, gameId: string) => {
  const existing = await db.getFirstAsync<{ id: string; deletedAt: string | null }>(
    'SELECT id, deleted_at AS deletedAt FROM ratings WHERE game_id = ?',
    gameId,
  );
  const now = new Date().toISOString();
  if (existing && !existing.deletedAt) {
    return existing.id;
  }
  if (existing) {
    await db.runAsync('DELETE FROM ratings WHERE id = ?', existing.id);
  }
  const setId = await pickSet(db, gameId);
  if (!setId) {
    throw new Error('No rating set matches this game');
  }
  const id = randomUUID();
  await db.runAsync(
    'INSERT INTO ratings (id, game_id, set_id, rated_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    gameId,
    setId,
    now,
    now,
    now,
  );
  await applySet(db, id, setId);
  return id;
};

export const setScore = (db: SQLiteDatabase, gameId: string, metricId: string, score: number) =>
  db.withTransactionAsync(async () => {
    const ratingId = await ensureRating(db, gameId);
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE rating_scores SET score = ?, updated_at = ? WHERE rating_id = ? AND metric_id = ? AND weight > 0',
      score,
      now,
      ratingId,
      metricId,
    );
    await db.runAsync('UPDATE ratings SET rated_at = ?, updated_at = ? WHERE id = ?', now, now, ratingId);
  });

export const setReview = (db: SQLiteDatabase, gameId: string, review: string) =>
  db.withTransactionAsync(async () => {
    const ratingId = await ensureRating(db, gameId);
    const text = review.trim();
    await db.runAsync(
      'UPDATE ratings SET review = ?, updated_at = ? WHERE id = ?',
      text.length > 0 ? text : null,
      new Date().toISOString(),
      ratingId,
    );
  });

export const switchSet = (db: SQLiteDatabase, gameId: string, setId: string) =>
  db.withTransactionAsync(async () => {
    const ratingId = await ensureRating(db, gameId);
    await applySet(db, ratingId, setId);
    const now = new Date().toISOString();
    for (const seriesId of (await gameSignals(db, gameId)).series.slice(0, 1)) {
      await db.runAsync(
        `INSERT INTO rating_series_sets (id, series_igdb_id, set_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (series_igdb_id) DO UPDATE SET set_id = excluded.set_id, deleted_at = NULL, updated_at = excluded.updated_at`,
        randomUUID(),
        seriesId,
        setId,
        now,
        now,
      );
    }
  });

export const recalculateSet = (db: SQLiteDatabase, setId: string) =>
  db.withTransactionAsync(async () => {
    const ratings = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM ratings WHERE set_id = ? AND deleted_at IS NULL',
      setId,
    );
    for (const rating of ratings) {
      await applySet(db, rating.id, setId);
    }
  });

export const isValidSet = (weights: SetWeight[]) =>
  weights.length >= minMetrics &&
  weights.length <= maxMetrics &&
  new Set(weights.map((item) => item.metricId)).size === weights.length &&
  weights.every((item) => Number.isInteger(item.weight) && item.weight >= 1) &&
  weights.reduce((total, item) => total + item.weight, 0) === 100;

export const updateSetWeights = async (db: SQLiteDatabase, setId: string, weights: SetWeight[]) => {
  if (!isValidSet(weights)) {
    return false;
  }
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE rating_set_metrics SET deleted_at = ?, updated_at = ? WHERE set_id = ? AND deleted_at IS NULL',
      now,
      now,
      setId,
    );
    for (const [index, { metricId, weight }] of weights.entries()) {
      await db.runAsync(
        `INSERT INTO rating_set_metrics (id, set_id, metric_id, weight, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        randomUUID(),
        setId,
        metricId,
        weight,
        index + 1,
        now,
        now,
      );
    }
    await db.runAsync('UPDATE rating_sets SET updated_at = ? WHERE id = ?', now, setId);
  });
  return true;
};

export const resetDefaultSet = async (db: SQLiteDatabase, setId: string) => {
  const set = await db.getFirstAsync<{ defaultKey: string | null }>(
    'SELECT default_key AS defaultKey FROM rating_sets WHERE id = ?',
    setId,
  );
  const weights = set?.defaultKey ? defaultSetWeights[set.defaultKey] : undefined;
  return weights ? updateSetWeights(db, setId, weights) : false;
};

export const deleteRating = (db: SQLiteDatabase, gameId: string) => {
  const now = new Date().toISOString();
  return db.runAsync(
    'UPDATE ratings SET deleted_at = ?, updated_at = ? WHERE game_id = ? AND deleted_at IS NULL',
    now,
    now,
    gameId,
  );
};

const overallOf = (scores: RatingScore[]) => {
  if (scores.length === 0 || scores.some((item) => item.score === null)) {
    return null;
  }
  const total = scores.reduce((sum, item) => sum + item.weight, 0);
  const weighted = scores.reduce((sum, item) => sum + (item.score ?? 0) * item.weight, 0);
  return Math.round((weighted / total) * 10) / 10;
};

const fetchRating = async (db: SQLiteDatabase, gameId: string): Promise<Rating | null> => {
  const rating = await db.getFirstAsync<Omit<Rating, 'scores' | 'overall' | 'isDraft'>>(
    `SELECT r.id, r.set_id AS setId, s.name AS setName, r.review, r.rated_at AS ratedAt
    FROM ratings r
    JOIN rating_sets s ON s.id = r.set_id
    WHERE r.game_id = ? AND r.deleted_at IS NULL`,
    gameId,
  );
  if (!rating) {
    return null;
  }
  const scores = await db.getAllAsync<RatingScore>(
    `SELECT rs.metric_id AS metricId, m.name, rs.score, rs.weight
    FROM rating_scores rs
    JOIN metrics m ON m.id = rs.metric_id
    LEFT JOIN rating_set_metrics sm ON sm.set_id = ? AND sm.metric_id = rs.metric_id AND sm.deleted_at IS NULL
    WHERE rs.rating_id = ? AND rs.weight > 0
    ORDER BY sm.position IS NULL, sm.position, rs.weight DESC`,
    rating.setId,
    rating.id,
  );
  const overall = overallOf(scores);
  return { ...rating, scores, overall, isDraft: overall === null };
};

export const useRating = (gameId: string) => {
  const query = useCallback((db: SQLiteDatabase) => fetchRating(db, gameId), [gameId]);
  return useLiveQuery(query, ratingTables);
};
