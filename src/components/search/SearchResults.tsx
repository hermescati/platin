import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { activityStatusLabels } from '@/components/library/labels';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import { useCatalogSearch } from '@/components/search/useCatalogSearch';
import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import { Text } from '@/components/ui/Text';
import { useLibrary } from '@/db/library';
import type { CatalogGame } from '@/lib/catalog';
import { space } from '@/theme/tokens';
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
      style={{ backgroundColor: color.bg.screen }}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset + space[16] }]}>
      {libraryMatches.length > 0 && (
        <>
          <Text variant="eyebrow" tone="secondary" style={styles.section}>In your library</Text>
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
      <Text variant="eyebrow" tone="secondary" style={styles.section}>Catalog</Text>
      {catalog.loading && <ActivityIndicator style={styles.status} color={color.text.secondary} />}
      {catalog.error && <Text variant="subhead" tone="secondary" style={styles.message}>{catalog.error}</Text>}
      {!catalog.loading && !catalog.error && catalog.results.length === 0 && (
        <Text variant="subhead" tone="secondary" style={styles.message}>No games found</Text>
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
    paddingHorizontal: space[16],
    paddingTop: space[8],
  },
  section: {
    marginTop: space[16],
    marginBottom: space[4],
  },
  status: {
    paddingVertical: space[24],
  },
  message: {
    paddingVertical: space[16],
  },
});
