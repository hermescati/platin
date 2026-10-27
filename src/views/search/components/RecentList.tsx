import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, StyleSheet, View } from 'react-native';

import { clearRecentSearches, removeRecentSearch } from '@/db/recentSearches';
import { space } from '@/theme/tokens';
import { SectionHeader } from '@/ui/SectionHeader';
import { Text } from '@/ui/Text';
import { SearchRow } from '@/views/search/components/SearchRow';

interface Props {
  recents: string[];
  onPick: (query: string) => void;
}

export const RecentList = ({ recents, onPick }: Props) => {
  const db = useSQLiteContext();

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Recent"
        accessory={
          <Pressable onPress={() => clearRecentSearches(db)} accessibilityRole="button" hitSlop={space[8]}>
            <Text variant="subhead" tone="accent">Clear</Text>
          </Pressable>
        }
      />
      <View>
        {recents.map((recent) => (
          <SearchRow
            key={recent}
            title={recent}
            icon="clock"
            accessory="remove"
            onPress={() => onPick(recent)}
            onAccessoryPress={() => removeRecentSearch(db, recent)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: space[16],
  },
});
