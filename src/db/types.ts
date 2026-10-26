export type GameStatus = 'wishlist' | 'backlog' | 'playing' | 'beaten' | 'archived' | 'dropped';

export type Tier = 'main_story' | 'completionist' | 'platinum';

export interface CatalogRecord {
  igdbId: number;
  name: string;
  slug: string | null;
  coverImageId: string | null;
  releaseDate: number | null;
  gameType: string | null;
  parentIgdbId: number | null;
  developer: string | null;
  criticScore: number | null;
  criticCount: number | null;
  mainStorySeconds: number | null;
  completionistSeconds: number | null;
  hasEnding: boolean;
  data: unknown;
  igdbUpdatedAt: number | null;
}

export interface LibraryGame {
  id: string;
  igdbId: number;
  title: string;
  coverImageId: string | null;
  releaseYear: number | null;
  gameType: string | null;
  status: GameStatus;
  tier: Tier | null;
  platforms: string | null;
}

export interface PlatformRecord {
  igdbId: number;
  name: string;
  abbreviation: string | null;
  slug: string | null;
  generation: number | null;
  family: string | null;
  type: string | null;
  logoImageId: string | null;
  igdbUpdatedAt: number | null;
}

export interface Platform {
  id: number;
  name: string;
  shortName: string;
  family: string | null;
  generation: number | null;
}

export interface Playtime {
  totalMinutes: number;
  platforms: { id: number; shortName: string; minutes: number }[];
}

export type RunType = 'playthrough' | 'speedrun' | 'difficulty' | 'other';

export type RunState = 'open' | 'finished' | 'gave_up';

export interface NewRun {
  copyId: string;
  type: RunType;
  name: string;
  rule?: string;
  category?: string;
  targetSeconds?: number;
}

export interface Run {
  id: string;
  copyId: string;
  platform: string;
  type: RunType;
  name: string;
  rule: string | null;
  category: string | null;
  targetSeconds: number | null;
  startedAt: string;
  finishedAt: string | null;
  gaveUpAt: string | null;
  state: RunState;
  minutes: number;
  bestSeconds: number | null;
  attempts: number;
}

export interface SetWeight {
  metricId: string;
  weight: number;
}

export interface RatingScore {
  metricId: string;
  name: string;
  score: number | null;
  weight: number;
}

export interface Rating {
  id: string;
  setId: string;
  setName: string;
  review: string | null;
  ratedAt: string;
  scores: RatingScore[];
  overall: number | null;
  isDraft: boolean;
}

export interface RemovedGame {
  id: string;
  tier: Tier | null;
  totalMinutes: number;
  platforms: string | null;
  addons: number;
}

export interface GameDetail {
  id: string;
  igdbId: number;
  title: string;
  coverImageId: string | null;
  releaseYear: number | null;
  developer: string | null;
  hasEnding: boolean;
  status: GameStatus;
  tier: Tier | null;
  platformIds: number[];
  canEarnPlatinum: boolean;
}
