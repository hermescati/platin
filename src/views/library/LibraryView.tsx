import { useLibrary } from '@/db/library';
import { EmptyState } from '@/ui/EmptyState';
import { LibraryGrid } from '@/views/library/components/LibraryGrid';

export const LibraryView = () => {
  const games = useLibrary();

  return games?.length === 0 ? (
    <EmptyState title="Your library is empty" description="Search for a game to add it to your backlog or wishlist." />
  ) : (
    <LibraryGrid games={games ?? []} />
  );
};
