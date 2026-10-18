import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const DiscoverScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Discover' }} />
    <EmptyState
      title="Nothing to discover yet"
      description="New releases, trending games and picks based on your library will show up here."
    />
  </>
);

export default DiscoverScreen;
