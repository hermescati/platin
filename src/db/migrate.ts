import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from '@/db/migrations';

export const migrate = async (db: SQLiteDatabase) => {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migrations[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
};
