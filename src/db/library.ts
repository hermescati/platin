import type { SQLiteDatabase } from 'expo-sqlite';

import type { LibraryGame } from '@/db/types';
import { useLiveQuery } from '@/db/useLiveQuery';

const libraryTables = ['games', 'copies'] as const;

const fetchLibrary = (db: SQLiteDatabase) =>
  db.getAllAsync<LibraryGame>(`
    SELECT
      g.id,
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
