import type { SQLiteDatabase } from 'expo-sqlite';

import { useLiveQuery } from '@/db/useLiveQuery';

const recentTables = ['recent_searches'] as const;
const keep = 10;
const shown = 5;

const fetchRecentSearches = async (db: SQLiteDatabase) => {
  const rows = await db.getAllAsync<{ query: string }>(
    'SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT ?',
    shown,
  );
  return rows.map((row) => row.query);
};

export const useRecentSearches = () => useLiveQuery(fetchRecentSearches, recentTables);

export const saveRecentSearch = async (db: SQLiteDatabase, query: string) => {
  const text = query.trim();
  if (!text) {
    return;
  }
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO recent_searches (query, searched_at) VALUES (?, ?)
      ON CONFLICT (query) DO UPDATE SET query = excluded.query, searched_at = excluded.searched_at`,
      text,
      new Date().toISOString(),
    );
    await db.runAsync(
      'DELETE FROM recent_searches WHERE query NOT IN (SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT ?)',
      keep,
    );
  });
};

export const removeRecentSearch = (db: SQLiteDatabase, query: string) =>
  db.runAsync('DELETE FROM recent_searches WHERE query = ?', query);

export const clearRecentSearches = (db: SQLiteDatabase) => db.runAsync('DELETE FROM recent_searches');
