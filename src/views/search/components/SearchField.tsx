import { SearchBar } from 'expo-lucent';
import { useSQLiteContext } from 'expo-sqlite';

import { searchPlaceholder } from '@/navigation/tabs';
import { saveRecentSearch } from '@/db/recentSearches';

export const SearchField = () => {
  const db = useSQLiteContext();

  return (
    <SearchBar
      placeholder={searchPlaceholder}
      onSearchButtonPress={(event) => saveRecentSearch(db, event.nativeEvent.text)}
    />
  );
};
