import { TabScrollView, useTabBarInset, useTabSearch } from 'expo-lucent';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { useLibrary } from '@/db/library';
import { saveRecentSearch, useRecentSearches } from '@/db/recentSearches';
import { catalogMinQuery, type CatalogGame } from '@/lib/catalog';
import { isAddon, statusIcons, statusLabels, typeBadge } from '@/shared/game/labels';
import { openCatalogGame, openGame } from '@/shared/game/routes';
import { useQuickAdd } from '@/shared/game/hooks/useQuickAdd';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { SectionHeader } from '@/ui/SectionHeader';
import { Toast, type ToastData } from '@/ui/Toast';
import { RecentList } from '@/views/search/components/RecentList';
import { ResultTile } from '@/views/search/components/ResultTile';
import { ResultsSkeleton } from '@/views/search/components/ResultsSkeleton';
import { resultMeta } from '@/views/search/utils/resultMeta';
import { SearchField } from '@/views/search/components/SearchField';
import { SearchMessage } from '@/views/search/components/SearchMessage';
import { SearchOverlay, type Anchor } from '@/views/search/components/SearchOverlay';
import { SuggestionList } from '@/views/search/components/SuggestionList';
import { TopResultCard, type TopResultAccessory } from '@/views/search/components/TopResultCard';
import { useCatalogSearch } from '@/views/search/hooks/useCatalogSearch';

interface Presentation {
  anchor?: Anchor;
  lift?: 'card' | 'tile';
}

const suggestionLimit = 3;

export const SearchView = () => {
  const db = useSQLiteContext();
  const { color } = useTheme();
  const { width } = useWindowDimensions();
  const tabBarInset = useTabBarInset();
  const dockTop = Math.max(tabBarInset, layout.dockTop);
  const { query, isFocused, setText } = useTabSearch();
  const trimmed = query.trim();
  const library = useLibrary();
  const recents = useRecentSearches();
  const catalog = useCatalogSearch(query);
  const [presentation, setPresentation] = useState<Presentation>({});
  const [toast, setToast] = useState<ToastData | null>(null);
  const [added, setAdded] = useState<number[]>([]);
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const plusRef = useRef<ComponentRef<typeof View>>(null);

  const columns = layout.searchColumns;
  const tileWidth = Math.floor((width - space.gutter * 2 - space[16] * (columns - 1)) / columns);
  const entries = useMemo(() => new Map((library ?? []).map((game) => [game.igdbId, game])), [library]);
  const suggestions = useMemo(
    () =>
      (library ?? [])
        .filter((game) => trimmed.length > 0 && game.title.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, suggestionLimit),
    [library, trimmed],
  );
  const hideToast = useCallback(() => setToast(null), []);

  const remember = () => saveRecentSearch(db, trimmed);

  const showToast = (title: string, gameIgdbId?: number) =>
    setToast({
      id: Date.now(),
      title,
      action:
        gameIgdbId === undefined
          ? undefined
          : {
              label: 'Edit',
              onPress: async () => {
                const row = await db.getFirstAsync<{ id: string }>(
                  'SELECT id FROM library_games WHERE igdb_id = ? AND deleted_at IS NULL',
                  gameIgdbId,
                );
                setToast(null);
                if (row) {
                  openGame(row.id);
                }
              },
            },
    });

  const quickAdd = useQuickAdd({
    onAdded: (game, status) => {
      remember();
      setAdded((current) => [...current, game.id]);
      showToast(`Added to ${statusLabels[status]}`, game.id);
    },
    onMessage: (message) => showToast(message),
  });

  const open = (game: CatalogGame) => {
    remember();
    const entry = entries.get(game.id);
    if (entry) {
      openGame(entry.id);
    } else {
      openCatalogGame(game);
    }
  };

  const openAddMenu = (game: CatalogGame) => {
    const root = rootRef.current;
    const button = plusRef.current;
    if (!root || !button) {
      setPresentation({});
      quickAdd.open({ game });
      return;
    }
    root.measureInWindow((rootX, rootY) => {
      button.measureInWindow((x, y, buttonWidth, buttonHeight) => {
        setPresentation({ anchor: { x: x - rootX, y: y - rootY, width: buttonWidth, height: buttonHeight } });
        quickAdd.open({ game });
      });
    });
  };

  const lift = (game: CatalogGame, kind: 'card' | 'tile') => {
    setPresentation({ lift: kind });
    quickAdd.open({ game, entry: entries.get(game.id) });
  };

  const accessoryFor = (game: CatalogGame): TopResultAccessory =>
    added.includes(game.id) ? 'check' : entries.has(game.id) ? 'chevron' : 'plus';

  const statusLine = (game: CatalogGame) => {
    const entry = entries.get(game.id);
    return entry ? [statusLabels[entry.status], entry.platforms?.split(' · ')[0]].filter(Boolean).join(' · ') : 'Not in library';
  };

  const renderTop = (game: CatalogGame, interactive: boolean) => {
    const accessory = accessoryFor(game);
    return (
      <TopResultCard
        title={game.name}
        coverImageId={game.coverId}
        status={statusLine(game)}
        meta={resultMeta(game)}
        accessory={accessory}
        accessoryPressed={quickAdd.menu?.game.id === game.id && !presentation.lift}
        accessoryRef={interactive ? plusRef : undefined}
        onPress={interactive ? () => open(game) : undefined}
        onLongPress={interactive ? () => lift(game, 'card') : undefined}
        onAccessoryPress={interactive ? (accessory === 'plus' ? () => openAddMenu(game) : () => open(game)) : undefined}
      />
    );
  };

  const renderTile = (game: CatalogGame, interactive: boolean) => {
    const entry = entries.get(game.id);
    return (
      <ResultTile
        key={game.id}
        title={game.name}
        subtitle={resultMeta(game)}
        coverImageId={game.coverId}
        width={tileWidth}
        badge={isAddon(game.type) ? typeBadge(game.type) : null}
        statusIcon={entry ? statusIcons[entry.status] : undefined}
        onPress={interactive ? () => open(game) : undefined}
        onLongPress={interactive ? () => lift(game, 'tile') : undefined}
      />
    );
  };

  const renderBody = () => {
    if (trimmed.length < catalogMinQuery) {
      if (isFocused && recents && recents.length > 0) {
        return <RecentList recents={recents} onPick={setText} />;
      }
      return (
        <SearchMessage
          icon="search"
          title="Search everything"
          body="Find games in your library or the full catalog to add them."
        />
      );
    }
    if (catalog.error) {
      return (
        <SearchMessage
          icon="warning"
          title="Can’t reach search"
          body="Search looks games up live, so it needs a connection. Your library, playtime and trophies still work offline."
          action={{ label: 'Try again', icon: 'search', onPress: catalog.retry }}
        />
      );
    }
    if (catalog.loading) {
      if (suggestions.length > 0) {
        return (
          <SuggestionList
            games={suggestions}
            highlight={trimmed}
            onOpen={(game) => {
              remember();
              openGame(game.id);
            }}
            onFill={setText}
          />
        );
      }
      return <ResultsSkeleton tileWidth={tileWidth} />;
    }
    const [top, ...rest] = catalog.results;
    if (!top) {
      return (
        <SearchMessage
          icon="search"
          title="No games called"
          highlight={trimmed}
          body="Check the spelling, or try a studio or series instead."
        />
      );
    }
    return (
      <>
        <View style={styles.section}>
          <SectionHeader title="Top result" />
          {renderTop(top, true)}
        </View>
        {rest.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="More results" />
            <View style={styles.grid}>{rest.map((game) => renderTile(game, true))}</View>
          </View>
        )}
      </>
    );
  };

  const menu = quickAdd.menu;

  return (
    <View ref={rootRef} style={[styles.root, { backgroundColor: color.bg.screen }]}>
      <SearchField />
      <TabScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {renderBody()}
      </TabScrollView>

      {menu && (
        <SearchOverlay
          title={quickAdd.title}
          items={quickAdd.items}
          selected={quickAdd.selected}
          bottom={dockTop}
          anchor={presentation.lift ? undefined : presentation.anchor}
          liftKind={presentation.lift}
          lifted={
            presentation.lift === 'card'
              ? renderTop(menu.game, false)
              : presentation.lift === 'tile'
                ? renderTile(menu.game, false)
                : undefined
          }
          onSelect={quickAdd.select}
          onClose={quickAdd.close}
        />
      )}

      <Toast toast={toast} bottom={dockTop + space.aboveDock} onHide={hideToast} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.gutter,
    paddingTop: space[8],
    paddingBottom: space[32],
    gap: space[32],
  },
  section: {
    gap: space[16],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: space[16],
    rowGap: space[24],
  },
});
