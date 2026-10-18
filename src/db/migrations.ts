export const migrations: string[] = [
  `
  CREATE TABLE platforms (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    has_achievements INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE games (
    id TEXT PRIMARY KEY NOT NULL,
    igdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    cover_image_id TEXT,
    release_year INTEGER,
    activity_status TEXT NOT NULL DEFAULT 'backlog'
      CHECK (activity_status IN ('wishlist', 'backlog', 'playing', 'dropped')),
    completion_tier TEXT
      CHECK (completion_tier IN ('beaten', 'completed', 'mastered')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE copies (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms (id),
    edition TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE INDEX copies_game_id ON copies (game_id);
  CREATE INDEX games_activity_status ON games (activity_status);

  INSERT INTO platforms (id, name, short_name, has_achievements, sort_order) VALUES
    ('ps5', 'PlayStation 5', 'PS5', 1, 10),
    ('ps4', 'PlayStation 4', 'PS4', 1, 20),
    ('xbox-series', 'Xbox Series X|S', 'Xbox', 1, 30),
    ('switch-2', 'Nintendo Switch 2', 'Switch 2', 0, 40),
    ('switch', 'Nintendo Switch', 'Switch', 0, 50),
    ('pc', 'PC', 'PC', 1, 60);
  `,
  `
  DELETE FROM copies WHERE game_id IN (SELECT id FROM games WHERE igdb_id IS NULL);
  DELETE FROM games WHERE igdb_id IS NULL;
  `,
];
