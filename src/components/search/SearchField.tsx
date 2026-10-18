import { Stack } from 'expo-router';

import { useSearchQuery } from '@/components/search/SearchQuery';
import { searchPlaceholder } from '@/components/tab-bar/tabs';

export const SearchField = () => {
  const { setQuery } = useSearchQuery();

  return (
    <Stack.SearchBar
      placement="automatic"
      placeholder={searchPlaceholder}
      onChangeText={(event) => setQuery(event.nativeEvent.text)}
    />
  );
};
