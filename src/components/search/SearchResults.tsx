import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { activityStatusLabels } from '@/components/library/labels';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import { useCatalogSearch } from '@/components/search/useCatalogSearch';
import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import { useLibrary } from '@/db/library';
import type { CatalogGame } from '@/lib/catalog';
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
  const owned = new Map((library ?? []).filter((game) => game.igdbId !== null).map((game) => [game.igdbId, game]));

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
              onPress={() => openGame(game.id)}
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
      {catalog.results.map((game) => {
        const entry = owned.get(game.id);
        return (
          <SearchResultRow
            key={game.id}
            title={game.name}
            coverImageId={game.coverId}
            detail={
              entry
                ? `In library · ${activityStatusLabels[entry.activityStatus]}`
                : [game.releaseYear, game.platforms.slice(0, 3).join(', ')].filter(Boolean).join(' · ')
            }
            onPress={() => (entry ? openGame(entry.id) : addGame(game))}
          />
        );
      })}
    </Animated.ScrollView>
  );
};

const openGame = (id: string) => router.push({ pathname: '/game/[id]', params: { id } });

const addGame = (game: CatalogGame) => router.push({ pathname: '/add-game', params: { game: JSON.stringify(game) } });

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
