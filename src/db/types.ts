export type ActivityStatus = 'wishlist' | 'backlog' | 'playing' | 'dropped';

export type CompletionTier = 'beaten' | 'completed' | 'mastered';

export interface LibraryGame {
  id: string;
  title: string;
  coverImageId: string | null;
  activityStatus: ActivityStatus;
  completionTier: CompletionTier | null;
  platforms: string | null;
}
