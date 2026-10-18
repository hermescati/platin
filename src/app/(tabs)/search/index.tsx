import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SearchField } from '@/components/search/SearchField';

const SearchScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Search' }} />
    <SearchField />
    <EmptyState title="Search everything" description="Find games in your library or the full catalog to add them." />
  </>
);

export default SearchScreen;
