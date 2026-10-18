import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { ActivityStatus, CompletionTier } from '@/db/types';

interface SeedGame {
  title: string;
  status: ActivityStatus;
  tier?: CompletionTier;
  platforms: string[];
}

const seedGames: SeedGame[] = [
  { title: 'Resident Evil Requiem', status: 'playing', tier: 'beaten', platforms: ['ps5'] },
  { title: 'Hades II', status: 'playing', platforms: ['pc'] },
  { title: 'Hollow Knight: Silksong', status: 'playing', platforms: ['switch-2'] },
  { title: 'Forza Horizon 5', status: 'playing', platforms: ['xbox-series'] },
  { title: 'Astro Bot', status: 'backlog', tier: 'mastered', platforms: ['ps5'] },
  { title: 'Elden Ring', status: 'backlog', tier: 'completed', platforms: ['ps5'] },
  { title: 'God of War Ragnarök', status: 'backlog', tier: 'mastered', platforms: ['ps5', 'ps4'] },
  { title: 'Clair Obscur: Expedition 33', status: 'backlog', tier: 'beaten', platforms: ['ps5'] },
  { title: "Baldur's Gate 3", status: 'backlog', platforms: ['pc'] },
  { title: 'Watch Dogs 2', status: 'backlog', platforms: ['pc'] },
  { title: 'The Legend of Zelda: Tears of the Kingdom', status: 'backlog', tier: 'completed', platforms: ['switch'] },
  { title: 'Cyberpunk 2077', status: 'dropped', platforms: ['pc'] },
  { title: 'Death Stranding 2', status: 'wishlist', platforms: [] },
  { title: 'Metroid Prime 4: Beyond', status: 'wishlist', platforms: [] },
];

export const seedIfEmpty = async (db: SQLiteDatabase) => {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM games');
  if ((existing?.count ?? 0) > 0) {
    return;
  }

  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const game of seedGames) {
      const gameId = randomUUID();
      await txn.runAsync(
        'INSERT INTO games (id, title, activity_status, completion_tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        gameId,
        game.title,
        game.status,
        game.tier ?? null,
        now,
        now,
      );
      for (const platformId of game.platforms) {
        await txn.runAsync(
          'INSERT INTO copies (id, game_id, platform_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          randomUUID(),
          gameId,
          platformId,
          now,
          now,
        );
      }
    }
  });
};
