import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const SearchScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Search', headerSearchBarOptions: { placeholder: 'Search games' } }} />
    <EmptyState title="Find a game" description="Search by title to add it to your library." />
  </>
);

export default SearchScreen;
