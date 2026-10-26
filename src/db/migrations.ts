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
  `
  CREATE TABLE catalog_games (
    igdb_id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    slug TEXT,
    cover_image_id TEXT,
    release_date INTEGER,
    game_type TEXT,
    parent_igdb_id INTEGER,
    developer TEXT,
    critic_score REAL,
    critic_count INTEGER,
    main_story_seconds INTEGER,
    completionist_seconds INTEGER,
    has_ending INTEGER NOT NULL DEFAULT 1,
    data TEXT,
    igdb_updated_at INTEGER,
    fetched_at TEXT
  );

  INSERT INTO catalog_games (igdb_id, name, cover_image_id, release_date)
  SELECT
    igdb_id,
    title,
    cover_image_id,
    CASE WHEN release_year IS NULL THEN NULL ELSE CAST(strftime('%s', printf('%04d-01-01', release_year)) AS INTEGER) END
  FROM games;

  CREATE TABLE library_games (
    id TEXT PRIMARY KEY NOT NULL,
    igdb_id INTEGER NOT NULL UNIQUE REFERENCES catalog_games (igdb_id),
    status TEXT NOT NULL DEFAULT 'backlog'
      CHECK (status IN ('wishlist', 'backlog', 'playing', 'beaten', 'archived', 'dropped')),
    tier TEXT
      CHECK (tier IN ('main_story', 'completionist', 'platinum')),
    main_story_at TEXT,
    main_story_minutes INTEGER,
    completionist_at TEXT,
    completionist_minutes INTEGER,
    platinum_at TEXT,
    platinum_minutes INTEGER,
    parent_id TEXT REFERENCES library_games (id),
    plays_on_its_own INTEGER CHECK (plays_on_its_own IN (0, 1)),
    last_played_at TEXT,
    still_playing_dismissed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  INSERT INTO library_games (id, igdb_id, status, tier, created_at, updated_at, deleted_at)
  SELECT
    id,
    igdb_id,
    CASE WHEN completion_tier IS NOT NULL AND activity_status IN ('wishlist', 'backlog') THEN 'beaten' ELSE activity_status END,
    CASE completion_tier WHEN 'beaten' THEN 'main_story' WHEN 'completed' THEN 'completionist' WHEN 'mastered' THEN 'platinum' END,
    created_at,
    updated_at,
    deleted_at
  FROM games;

  CREATE TABLE copies_next (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT NOT NULL REFERENCES library_games (id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms (id),
    edition TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  INSERT INTO copies_next SELECT id, game_id, platform_id, edition, created_at, updated_at, deleted_at FROM copies;
  DROP TABLE copies;
  DROP TABLE games;
  ALTER TABLE copies_next RENAME TO copies;

  CREATE INDEX copies_game_id ON copies (game_id);
  CREATE INDEX library_games_status ON library_games (status);
  CREATE INDEX library_games_parent_id ON library_games (parent_id);
  `,
  `
  CREATE TABLE platforms_next (
    igdb_id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT,
    slug TEXT,
    generation INTEGER,
    family TEXT,
    type TEXT,
    logo_image_id TEXT,
    igdb_updated_at INTEGER,
    fetched_at TEXT
  );

  INSERT INTO platforms_next (igdb_id, name, abbreviation, slug, generation, family, type, logo_image_id) VALUES
    (167, 'PlayStation 5', 'PS5', 'ps5', 9, 'PlayStation', 'Console', 'plos'),
    (48, 'PlayStation 4', 'PS4', 'ps4--1', 8, 'PlayStation', 'Console', 'pl6f'),
    (169, 'Xbox Series X|S', 'Series X|S', 'series-x-s', 9, 'Xbox', 'Console', 'plfl'),
    (508, 'Nintendo Switch 2', 'Switch 2', 'switch-2', 9, 'Nintendo', 'Console', 'plow'),
    (130, 'Nintendo Switch', 'Switch', 'switch', 8, 'Nintendo', 'Console', 'plgu'),
    (6, 'PC (Microsoft Windows)', 'PC', 'win', NULL, NULL, 'Operating_system', 'plim');

  CREATE TABLE user_platforms (
    id TEXT PRIMARY KEY NOT NULL,
    platform_id INTEGER NOT NULL UNIQUE REFERENCES platforms_next (igdb_id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  INSERT INTO user_platforms (id, platform_id, created_at, updated_at)
  SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), platform, now, now
  FROM (
    SELECT DISTINCT CASE platform_id WHEN 'ps5' THEN 167 WHEN 'ps4' THEN 48 WHEN 'xbox-series' THEN 169 WHEN 'switch-2' THEN 508 WHEN 'switch' THEN 130 WHEN 'pc' THEN 6 END AS platform, strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AS now
    FROM copies
    WHERE deleted_at IS NULL
  );

  CREATE TABLE copies_next (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT NOT NULL REFERENCES library_games (id) ON DELETE CASCADE,
    platform_id INTEGER NOT NULL REFERENCES platforms_next (igdb_id),
    access TEXT NOT NULL DEFAULT 'owned'
      CHECK (access IN ('owned', 'subscription', 'borrowed', 'other')),
    format TEXT
      CHECK (format IN ('digital', 'physical')),
    store TEXT
      CHECK (store IN ('steam', 'epic', 'gog', 'ea_app', 'ubisoft_connect', 'battle_net', 'microsoft_store', 'other')),
    service TEXT
      CHECK (service IN ('ps_plus', 'game_pass', 'ubisoft_plus', 'ea_play', 'nintendo_switch_online', 'other')),
    edition TEXT,
    edition_igdb_id INTEGER,
    price_cents INTEGER CHECK (price_cents >= 0),
    currency TEXT CHECK (currency IN ('EUR', 'USD')),
    acquired_on TEXT,
    bundle_igdb_id INTEGER,
    source TEXT NOT NULL DEFAULT 'manual'
      CHECK (source IN ('manual', 'steam', 'psn')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  INSERT INTO copies_next (id, game_id, platform_id, edition, created_at, updated_at, deleted_at)
  SELECT id, game_id, CASE platform_id WHEN 'ps5' THEN 167 WHEN 'ps4' THEN 48 WHEN 'xbox-series' THEN 169 WHEN 'switch-2' THEN 508 WHEN 'switch' THEN 130 WHEN 'pc' THEN 6 END, edition, created_at, updated_at, deleted_at FROM copies;

  DROP TABLE copies;
  DROP TABLE platforms;
  ALTER TABLE platforms_next RENAME TO platforms;
  ALTER TABLE copies_next RENAME TO copies;

  CREATE INDEX copies_game_id ON copies (game_id);
  CREATE INDEX copies_platform_id ON copies (platform_id);
  `,
  `
  CREATE TABLE play_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    copy_id TEXT NOT NULL REFERENCES copies (id) ON DELETE CASCADE,
    played_on TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes > 0),
    source TEXT NOT NULL DEFAULT 'manual'
      CHECK (source IN ('manual', 'steam', 'psn')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE INDEX play_sessions_copy_id ON play_sessions (copy_id);
  CREATE INDEX play_sessions_played_on ON play_sessions (played_on);
  CREATE UNIQUE INDEX play_sessions_synced_day ON play_sessions (copy_id, played_on, source)
    WHERE source != 'manual' AND deleted_at IS NULL;
  `,
  `
  CREATE TABLE runs (
    id TEXT PRIMARY KEY NOT NULL,
    copy_id TEXT NOT NULL REFERENCES copies (id) ON DELETE CASCADE,
    type TEXT NOT NULL
      CHECK (type IN ('playthrough', 'speedrun', 'difficulty', 'other')),
    name TEXT NOT NULL,
    rule TEXT,
    category TEXT,
    target_seconds INTEGER CHECK (target_seconds > 0),
    started_at TEXT NOT NULL,
    finished_at TEXT,
    gave_up_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    CHECK (finished_at IS NULL OR gave_up_at IS NULL),
    CHECK (type != 'speedrun' OR finished_at IS NULL)
  );

  CREATE INDEX runs_copy_id ON runs (copy_id);
  CREATE UNIQUE INDEX runs_open_per_copy ON runs (copy_id)
    WHERE type != 'speedrun' AND finished_at IS NULL AND gave_up_at IS NULL AND deleted_at IS NULL;

  CREATE TABLE run_attempts (
    id TEXT PRIMARY KEY NOT NULL,
    run_id TEXT NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
    attempted_on TEXT NOT NULL,
    seconds INTEGER NOT NULL CHECK (seconds > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE INDEX run_attempts_run_id ON run_attempts (run_id);

  ALTER TABLE play_sessions ADD COLUMN run_id TEXT REFERENCES runs (id) ON DELETE SET NULL;
  CREATE INDEX play_sessions_run_id ON play_sessions (run_id);
  `,
  `
  CREATE TABLE metrics (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_custom INTEGER NOT NULL DEFAULT 0 CHECK (is_custom IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE rating_sets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    default_key TEXT UNIQUE,
    match TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE rating_set_metrics (
    id TEXT PRIMARY KEY NOT NULL,
    set_id TEXT NOT NULL REFERENCES rating_sets (id) ON DELETE CASCADE,
    metric_id TEXT NOT NULL REFERENCES metrics (id),
    weight INTEGER NOT NULL CHECK (weight BETWEEN 1 AND 100),
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE UNIQUE INDEX rating_set_metrics_unique ON rating_set_metrics (set_id, metric_id) WHERE deleted_at IS NULL;

  CREATE TABLE rating_series_sets (
    id TEXT PRIMARY KEY NOT NULL,
    series_igdb_id INTEGER NOT NULL UNIQUE,
    set_id TEXT NOT NULL REFERENCES rating_sets (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE ratings (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT NOT NULL UNIQUE REFERENCES library_games (id) ON DELETE CASCADE,
    set_id TEXT NOT NULL REFERENCES rating_sets (id),
    review TEXT,
    rated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE rating_scores (
    id TEXT PRIMARY KEY NOT NULL,
    rating_id TEXT NOT NULL REFERENCES ratings (id) ON DELETE CASCADE,
    metric_id TEXT NOT NULL REFERENCES metrics (id),
    score INTEGER CHECK (score BETWEEN 1 AND 10),
    weight INTEGER NOT NULL CHECK (weight BETWEEN 0 AND 100),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE UNIQUE INDEX rating_scores_unique ON rating_scores (rating_id, metric_id);

  INSERT INTO metrics (id, name, description, created_at, updated_at) VALUES
    ('story', 'Story', 'Plot, writing and pacing.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('characters', 'Characters', 'The cast, performances, how much you cared.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('gameplay', 'Gameplay', 'The core loop, systems, builds, depth and mastery.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('controls', 'Controls', 'Feel and responsiveness: aiming, handling, movement, menus.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('world', 'World', 'Level design, layout, encounters, the open world and exploring it.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('difficulty', 'Difficulty', 'Challenge and balance: fair, well tuned, no cheap moments.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('visuals', 'Visuals', 'Graphics, art direction, mood and atmosphere.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('audio', 'Audio', 'Music, sound design and voice acting.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('performance', 'Performance', 'Frame rate, bugs, crashes, loading.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('online', 'Online', 'Multiplayer and co-op: netcode, matchmaking, community.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('value', 'Value', 'Length and amount of content, and whether it was worth the price.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('replay', 'Replay', 'Reasons to come back: post-game, modes, longevity.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

  INSERT INTO rating_sets (id, name, default_key, match, sort_order, created_at, updated_at) VALUES
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Multiplayer', 'multiplayer', '{"noSinglePlayer":true,"modes":["Massively Multiplayer Online (MMO)","Battle Royale"],"genres":["MOBA"]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Horror', 'horror', '{"themes":["Horror"]}', 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Story & world', 'story_world', '{"storyline":true,"genres":["Role-playing (RPG)","Adventure","Visual Novel"],"themes":["Drama","Mystery"]}', 3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Strategy & sim', 'strategy_sim', '{"genres":["Strategy","Real Time Strategy (RTS)","Turn-based strategy (TBS)","Tactical","Simulator","Card & Board Game"],"themes":["4X (explore, expand, exploit, and exterminate)"]}', 4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Racing & sports', 'racing_sports', '{"genres":["Racing","Sport","Pinball"]}', 5, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Action', 'action', '{"genres":["Shooter","Platform","Fighting","Hack and slash/Beat ''em up","Arcade"]}', 6, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), 'Standard', 'standard', '{"fallback":true}', 7, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

  INSERT INTO rating_set_metrics (id, set_id, metric_id, weight, position, created_at, updated_at)
  SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))), s.id, w.metric_id, w.weight, w.position, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  FROM (
    SELECT 'multiplayer' AS default_key, 'gameplay' AS metric_id, 35 AS weight, 1 AS position
    UNION ALL
    SELECT 'multiplayer' AS default_key, 'online' AS metric_id, 25 AS weight, 2 AS position
    UNION ALL
    SELECT 'multiplayer' AS default_key, 'performance' AS metric_id, 20 AS weight, 3 AS position
    UNION ALL
    SELECT 'multiplayer' AS default_key, 'difficulty' AS metric_id, 20 AS weight, 4 AS position
    UNION ALL
    SELECT 'horror' AS default_key, 'visuals' AS metric_id, 35 AS weight, 1 AS position
    UNION ALL
    SELECT 'horror' AS default_key, 'audio' AS metric_id, 30 AS weight, 2 AS position
    UNION ALL
    SELECT 'horror' AS default_key, 'story' AS metric_id, 15 AS weight, 3 AS position
    UNION ALL
    SELECT 'horror' AS default_key, 'gameplay' AS metric_id, 15 AS weight, 4 AS position
    UNION ALL
    SELECT 'horror' AS default_key, 'performance' AS metric_id, 5 AS weight, 5 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'story' AS metric_id, 25 AS weight, 1 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'gameplay' AS metric_id, 20 AS weight, 2 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'world' AS metric_id, 15 AS weight, 3 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'characters' AS metric_id, 10 AS weight, 4 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'visuals' AS metric_id, 10 AS weight, 5 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'audio' AS metric_id, 10 AS weight, 6 AS position
    UNION ALL
    SELECT 'story_world' AS default_key, 'performance' AS metric_id, 10 AS weight, 7 AS position
    UNION ALL
    SELECT 'strategy_sim' AS default_key, 'gameplay' AS metric_id, 30 AS weight, 1 AS position
    UNION ALL
    SELECT 'strategy_sim' AS default_key, 'difficulty' AS metric_id, 20 AS weight, 2 AS position
    UNION ALL
    SELECT 'strategy_sim' AS default_key, 'controls' AS metric_id, 20 AS weight, 3 AS position
    UNION ALL
    SELECT 'strategy_sim' AS default_key, 'replay' AS metric_id, 20 AS weight, 4 AS position
    UNION ALL
    SELECT 'strategy_sim' AS default_key, 'performance' AS metric_id, 10 AS weight, 5 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'controls' AS metric_id, 25 AS weight, 1 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'gameplay' AS metric_id, 20 AS weight, 2 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'online' AS metric_id, 15 AS weight, 3 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'visuals' AS metric_id, 10 AS weight, 4 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'audio' AS metric_id, 10 AS weight, 5 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'value' AS metric_id, 10 AS weight, 6 AS position
    UNION ALL
    SELECT 'racing_sports' AS default_key, 'performance' AS metric_id, 10 AS weight, 7 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'gameplay' AS metric_id, 30 AS weight, 1 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'controls' AS metric_id, 20 AS weight, 2 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'world' AS metric_id, 15 AS weight, 3 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'difficulty' AS metric_id, 15 AS weight, 4 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'audio' AS metric_id, 10 AS weight, 5 AS position
    UNION ALL
    SELECT 'action' AS default_key, 'performance' AS metric_id, 10 AS weight, 6 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'gameplay' AS metric_id, 30 AS weight, 1 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'value' AS metric_id, 20 AS weight, 2 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'replay' AS metric_id, 15 AS weight, 3 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'visuals' AS metric_id, 15 AS weight, 4 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'audio' AS metric_id, 10 AS weight, 5 AS position
    UNION ALL
    SELECT 'standard' AS default_key, 'performance' AS metric_id, 10 AS weight, 6 AS position
  ) AS w
  JOIN rating_sets s ON s.default_key = w.default_key;
  `,
  `
  UPDATE rating_sets
  SET match = '{"modes":["Massively Multiplayer Online (MMO)","Battle Royale"],"genres":["MOBA"]}',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE default_key = 'multiplayer';

  UPDATE rating_sets
  SET match = '{"genres":["Role-playing (RPG)","Adventure","Visual Novel"],"themes":["Drama","Mystery"]}',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE default_key = 'story_world';
  `,
  `
  CREATE TABLE recent_searches (
    query TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
    searched_at TEXT NOT NULL
  );

  CREATE INDEX recent_searches_searched_at ON recent_searches (searched_at);
  `,
];
