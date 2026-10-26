import { Stack } from 'expo-router';

import { SearchField } from '@/components/search/SearchField';
import { SearchResults } from '@/components/search/SearchResults';

const SearchScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Search' }} />
    <SearchField />
    <SearchResults />
  </>
);

export default SearchScreen;
