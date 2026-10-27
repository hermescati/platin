import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { clearRecentSearches, removeRecentSearch } from '@/db/recentSearches';
import { Icon } from '@/icons/Icon';
import { opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { EdgeFade } from '@/ui/EdgeFade';
import { SectionHeader } from '@/ui/SectionHeader';
import { Text } from '@/ui/Text';

interface Props {
  recents: string[];
  onPick: (query: string) => void;
}

export const RecentChips = ({ recents, onPick }: Props) => {
  const db = useSQLiteContext();
  const { color } = useTheme();

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
      <View style={styles.bleed}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.row}>
          {recents.map((recent) => (
            <Pressable
              key={recent}
              onPress={() => onPick(recent)}
              onLongPress={() => removeRecentSearch(db, recent)}
              accessibilityRole="button"
              accessibilityLabel={`Search ${recent}`}
              accessibilityHint="Long press to remove"
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: color.bg.raised, opacity: pressed ? opacity.pressed : 1 },
              ]}>
              <Icon name="clock" size={16} tone="secondary" />
              <Text variant="subheadEmphasized">{recent}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <EdgeFade />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: space[16],
  },
  bleed: {
    marginHorizontal: -space.gutter,
  },
  row: {
    paddingHorizontal: space.gutter,
    gap: space[8],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[6],
    paddingHorizontal: space[16],
    paddingVertical: space[8],
    borderRadius: radius.full,
  },
});
