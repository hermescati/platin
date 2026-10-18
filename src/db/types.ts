export type ActivityStatus = 'wishlist' | 'backlog' | 'playing' | 'dropped';

export type CompletionTier = 'beaten' | 'completed' | 'mastered';

export interface LibraryGame {
  id: string;
  igdbId: number | null;
  title: string;
  coverImageId: string | null;
  activityStatus: ActivityStatus;
  completionTier: CompletionTier | null;
  platforms: string | null;
}

export interface Platform {
  id: string;
  name: string;
  shortName: string;
}

export interface GameDetail {
  id: string;
  igdbId: number | null;
  title: string;
  coverImageId: string | null;
  releaseYear: number | null;
  activityStatus: ActivityStatus;
  completionTier: CompletionTier | null;
  platformIds: string[];
  canMaster: boolean;
}
