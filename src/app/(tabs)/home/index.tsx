import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const HomeScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Home' }} />
    <EmptyState title="Nothing logged yet" description="What you're playing and your recent sessions will show up here." />
  </>
);

export default HomeScreen;
