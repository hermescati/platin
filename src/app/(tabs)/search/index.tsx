import { Stack } from 'expo-router';

import { SearchView } from '@/views/search/SearchView';

const SearchScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Search' }} />
    <SearchView />
  </>
);

export default SearchScreen;
