import type { SQLiteDatabase } from 'expo-sqlite';

import type { Platform } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';

const igdbPlatforms: Record<string, string> = {
  PS5: 'ps5',
  PS4: 'ps4',
  'Series X|S': 'xbox-series',
  'Switch 2': 'switch-2',
  Switch: 'switch',
  PC: 'pc',
};

export const platformIdsFromIgdb = (names: string[]) => [
  ...new Set(names.map((name) => igdbPlatforms[name]).filter((id): id is string => Boolean(id))),
];

const platformTables = ['platforms'] as const;

const fetchPlatforms = (db: SQLiteDatabase) =>
  db.getAllAsync<Platform>('SELECT id, name, short_name AS shortName FROM platforms ORDER BY sort_order');

export const usePlatforms = () => useLiveQuery(fetchPlatforms, platformTables);
