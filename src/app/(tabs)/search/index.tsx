import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/search/SearchField';
import { useSearchQuery } from '@/components/search/SearchQuery';
import { SearchResults } from '@/components/search/SearchResults';
import { catalogMinQuery } from '@/lib/catalog';

const SearchScreen = () => {
  const { query } = useSearchQuery();

  return (
    <>
      <Stack.Screen options={{ title: 'Search' }} />
      <SearchField />
      {query.trim().length < catalogMinQuery ? (
        <EmptyState
          title="Search everything"
          description="Find games in your library or the full catalog to add them."
        />
      ) : (
        <SearchResults query={query} />
      )}
    </>
  );
};

export default SearchScreen;
