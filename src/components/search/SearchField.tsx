import { SearchBar } from 'expo-lucent';

import { searchPlaceholder } from '@/components/navigation/tabs';
import { useSearchQuery } from '@/components/search/SearchQuery';

export const SearchField = () => {
  const { setQuery } = useSearchQuery();

  return <SearchBar placeholder={searchPlaceholder} onChangeText={(event) => setQuery(event.nativeEvent.text)} />;
};
