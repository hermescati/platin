import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const ProfileScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Profile' }} />
    <EmptyState title="No stats yet" description="XP, streaks and your year in games will show up here." />
  </>
);

export default ProfileScreen;
