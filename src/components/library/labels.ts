import type { ActivityStatus, CompletionTier } from '@/db/types';

export const activityStatusLabels: Record<ActivityStatus, string> = {
  wishlist: 'Wishlist',
  backlog: 'Backlog',
  playing: 'Playing',
  dropped: 'Dropped',
};

export const completionTierLabels: Record<CompletionTier, string> = {
  beaten: 'Beaten',
  completed: 'Completed',
  mastered: 'Mastered',
};

export const activityStatuses: ActivityStatus[] = ['playing', 'backlog', 'wishlist', 'dropped'];

export const completionTiers: CompletionTier[] = ['beaten', 'completed', 'mastered'];
