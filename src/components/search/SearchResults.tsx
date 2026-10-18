import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { activityStatusLabels } from '@/components/library/labels';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import { useCatalogSearch } from '@/components/search/useCatalogSearch';
import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import { useLibrary } from '@/db/library';
import { fontSize, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  query: string;
}

export const SearchResults = ({ query }: Props) => {
  const { color } = useTheme();
  const tabBarInset = useTabBarInset();
  const library = useLibrary();
  const catalog = useCatalogSearch(query);
  const needle = query.trim().toLowerCase();
  const libraryMatches = (library ?? []).filter((game) => game.title.toLowerCase().includes(needle));

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: color.background }}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset + spacing.md }]}>
      {libraryMatches.length > 0 && (
        <>
          <Text style={[styles.section, { color: color.textSecondary }]}>In your library</Text>
          {libraryMatches.map((game) => (
            <SearchResultRow
              key={game.id}
              title={game.title}
              coverImageId={game.coverImageId}
              detail={[activityStatusLabels[game.activityStatus], game.platforms].filter(Boolean).join(' · ')}
            />
          ))}
        </>
      )}
      <Text style={[styles.section, { color: color.textSecondary }]}>Catalog</Text>
      {catalog.loading && <ActivityIndicator style={styles.status} color={color.textSecondary} />}
      {catalog.error && <Text style={[styles.message, { color: color.textSecondary }]}>{catalog.error}</Text>}
      {!catalog.loading && !catalog.error && catalog.results.length === 0 && (
        <Text style={[styles.message, { color: color.textSecondary }]}>No games found</Text>
      )}
      {catalog.results.map((game) => (
        <SearchResultRow
          key={game.id}
          title={game.name}
          coverImageId={game.coverId}
          detail={[game.releaseYear, game.platforms.slice(0, 3).join(', ')].filter(Boolean).join(' · ')}
        />
      ))}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  section: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  status: {
    paddingVertical: spacing.lg,
  },
  message: {
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
});
