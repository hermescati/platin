import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const LibraryScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Library' }} />
    <EmptyState title="Your library is empty" description="Search for a game to add it to your backlog or wishlist." />
  </>
);

export default LibraryScreen;
