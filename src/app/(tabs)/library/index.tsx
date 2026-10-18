import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { useLibrary } from '@/db/library';

const LibraryScreen = () => {
  const games = useLibrary();

  return (
    <>
      <Stack.Screen options={{ title: 'Library' }} />
      {games?.length === 0 ? (
        <EmptyState title="Your library is empty" description="Search for a game to add it to your backlog or wishlist." />
      ) : (
        <LibraryGrid games={games ?? []} />
      )}
    </>
  );
};

export default LibraryScreen;
