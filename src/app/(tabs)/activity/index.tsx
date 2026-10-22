import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const ActivityScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Activity' }} />
    <EmptyState title="No activity yet" description="Your sessions, streaks and stats will show up here." />
  </>
);

export default ActivityScreen;
