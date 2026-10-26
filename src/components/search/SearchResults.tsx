import { router } from 'expo-router';
import { TabScrollView, useTabBarInset, useTabSearch } from 'expo-lucent';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { statusLabels } from '@/components/library/labels';
import { ResultTile } from '@/components/search/ResultTile';
import { ResultsSkeleton } from '@/components/search/ResultsSkeleton';
import { isAddon, kindLabel, resultMeta, statusIcons, typeBadge } from '@/components/search/resultText';
import { SearchMessage } from '@/components/search/SearchMessage';
import { SearchRow } from '@/components/search/SearchRow';
import { TopResultCard, type TopResultAccessory } from '@/components/search/TopResultCard';
import { useCatalogSearch } from '@/components/search/useCatalogSearch';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Toast, type ToastData } from '@/components/ui/Toast';
import { addCatalogGame, removeGame, setStatus, useLibrary } from '@/db/library';
import { fetchPlatformsByIds, fetchUserPlatformIds } from '@/db/platforms';
import { clearRecentSearches, removeRecentSearch, saveRecentSearch, useRecentSearches } from '@/db/recentSearches';
import type { GameStatus, LibraryGame, Platform } from '@/db/types';
import { catalogMinQuery, type CatalogGame } from '@/lib/catalog';
import { layout, motion, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Overlay {
  game: CatalogGame;
  entry?: LibraryGame;
  anchor?: Anchor;
  lift?: 'card' | 'tile';
  step: 'status' | 'platform';
  status?: GameStatus;
  platforms?: Platform[];
}

const addStatuses: MenuItem[] = [
  { key: 'playing', label: 'Playing', sub: 'Started it', icon: 'gamepad' },
  { key: 'backlog', label: 'Backlog', sub: 'Own it, not started', icon: 'backlog' },
  { key: 'wishlist', label: 'Wishlist', sub: 'Want it', icon: 'bookmark' },
  { key: 'beaten', label: 'Beaten', sub: 'Finished it', icon: 'flag' },
];

const ownedStatuses: MenuItem[] = [
  ...addStatuses.map(({ key, label, icon }) => ({ key, label, icon })),
  { key: 'remove', label: 'Remove from library', icon: 'trash', destructive: true, groupStart: true },
];

const suggestionLimit = 3;

const platformLabel = (platform: Platform) => platform.name.replace(/\s*\(.*\)$/, '');

const openGame = (id: string) => router.push({ pathname: '/game/[id]', params: { id } });

const openCatalogGame = (game: CatalogGame) =>
  router.push({ pathname: '/add-game', params: { game: JSON.stringify(game) } });

export const SearchResults = () => {
  const db = useSQLiteContext();
  const { color } = useTheme();
  const { width, height } = useWindowDimensions();
  const tabBarInset = useTabBarInset();
  const dockTop = Math.max(tabBarInset, layout.dockTop);
  const { query, isFocused, setText } = useTabSearch();
  const trimmed = query.trim();
  const library = useLibrary();
  const recents = useRecentSearches();
  const catalog = useCatalogSearch(query);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
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

  const open = (game: CatalogGame) => {
    remember();
    const entry = entries.get(game.id);
    if (entry) {
      openGame(entry.id);
    } else {
      openCatalogGame(game);
    }
  };

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

  const add = async (game: CatalogGame, status: GameStatus, platformIds: number[]) => {
    setOverlay(null);
    await addCatalogGame(db, game, status, platformIds);
    remember();
    setAdded((current) => [...current, game.id]);
    showToast(`Added to ${statusLabels[status]}`, game.id);
  };

  const chooseStatus = async (current: Overlay, status: GameStatus) => {
    if (current.entry) {
      await setStatus(db, current.entry.id, status);
      setOverlay(null);
      showToast(`Moved to ${statusLabels[status]}`);
      return;
    }
    if (status === 'wishlist') {
      await add(current.game, status, []);
      return;
    }
    const [yours, gamePlatforms] = await Promise.all([
      fetchUserPlatformIds(db),
      fetchPlatformsByIds(db, current.game.platformIds),
    ]);
    const matching = gamePlatforms.filter((platform) => yours.includes(platform.id));
    const choices = matching.length > 0 ? matching : gamePlatforms;
    if (choices.length <= 1) {
      await add(current.game, status, choices.map((platform) => platform.id));
      return;
    }
    setOverlay({ ...current, step: 'platform', status, platforms: choices });
  };

  const select = async (key: string) => {
    if (!overlay) {
      return;
    }
    if (overlay.step === 'platform' && overlay.status) {
      await add(overlay.game, overlay.status, [Number(key)]);
      return;
    }
    if (key === 'remove' && overlay.entry) {
      await removeGame(db, overlay.entry.id);
      setOverlay(null);
      showToast(`Removed ${overlay.game.name}`);
      return;
    }
    await chooseStatus(overlay, key as GameStatus);
  };

  const openAddMenu = (game: CatalogGame) => {
    const root = rootRef.current;
    const button = plusRef.current;
    if (!root || !button) {
      setOverlay({ game, step: 'status' });
      return;
    }
    root.measureInWindow((rootX, rootY) => {
      button.measureInWindow((x, y, buttonWidth, buttonHeight) => {
        setOverlay({ game, step: 'status', anchor: { x: x - rootX, y: y - rootY, width: buttonWidth, height: buttonHeight } });
      });
    });
  };

  const lift = (game: CatalogGame, kind: 'card' | 'tile') =>
    setOverlay({ game, entry: entries.get(game.id), lift: kind, step: 'status' });

  const menuTitle = !overlay
    ? ''
    : overlay.step === 'platform'
      ? 'Add on which platform?'
      : overlay.entry
        ? 'Status'
        : 'Add to library as';
  const menuItems: MenuItem[] = !overlay
    ? []
    : overlay.step === 'platform'
      ? (overlay.platforms ?? []).map((platform) => ({ key: String(platform.id), label: platformLabel(platform) }))
      : overlay.entry
        ? ownedStatuses
        : addStatuses;

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
        accessoryPressed={overlay?.game.id === game.id && !overlay.lift}
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
                  onPress={() => setText(recent)}
                  onAccessoryPress={() => removeRecentSearch(db, recent)}
                />
              ))}
            </View>
          </View>
        );
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
          <View style={styles.section}>
            <SectionHeader title="Suggestions" />
            <View>
              {suggestions.map((game) => (
                <SearchRow
                  key={game.id}
                  title={game.title}
                  highlight={trimmed}
                  subtitle={[kindLabel(game.gameType), game.releaseYear, statusLabels[game.status]].filter(Boolean).join(' · ')}
                  coverImageId={game.coverImageId}
                  accessory="fill"
                  onPress={() => {
                    remember();
                    openGame(game.id);
                  }}
                  onAccessoryPress={() => setText(game.title)}
                />
              ))}
            </View>
          </View>
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

  const anchor = overlay?.anchor;
  const menuBelow = anchor ? anchor.y + anchor.height + space.popover : 0;
  const menuFits = anchor ? menuBelow + layout.menuRow * (menuItems.length + 1) < height - tabBarInset : true;

  return (
    <View ref={rootRef} style={[styles.root, { backgroundColor: color.bg.screen }]}>
      <TabScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {renderBody()}
      </TabScrollView>

      {overlay && (
        <Animated.View entering={FadeIn.duration(motion.fade)} exiting={FadeOut.duration(motion.fade)} style={StyleSheet.absoluteFill}>
          <Pressable
            style={[StyleSheet.absoluteFill, overlay.lift && { backgroundColor: color.overlay.scrim }]}
            onPress={() => setOverlay(null)}
            accessibilityLabel="Close menu"
          />
          {overlay.lift ? (
            <View pointerEvents="box-none" style={[styles.lift, { bottom: dockTop + space[24] }]}>
              <View
                pointerEvents="none"
                style={
                  overlay.lift === 'card'
                    ? [styles.liftedCard, { width: width - space.gutter * 2, shadowColor: color.shadow.lifted }]
                    : [styles.liftedTile, { shadowColor: color.shadow.lifted }]
                }>
                {overlay.lift === 'card' ? renderTop(overlay.game, false) : renderTile(overlay.game, false)}
              </View>
              <Menu title={menuTitle} items={menuItems} selected={overlay.entry?.status} onSelect={select} />
            </View>
          ) : anchor ? (
            <View
              style={[
                styles.anchored,
                { right: width - (anchor.x + anchor.width) },
                menuFits ? { top: menuBelow } : { bottom: height - anchor.y + space.popover },
              ]}>
              <Menu title={menuTitle} items={menuItems} onSelect={select} />
            </View>
          ) : (
            <View pointerEvents="box-none" style={[styles.lift, { bottom: dockTop + space[24] }]}>
              <Menu title={menuTitle} items={menuItems} onSelect={select} />
            </View>
          )}
        </Animated.View>
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
  lift: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: space[24],
  },
  liftedCard: {
    transform: [{ scale: motion.scale.liftCard }],
    shadowOffset: { width: 0, height: space[24] },
    shadowRadius: space[64],
    shadowOpacity: 1,
  },
  liftedTile: {
    transform: [{ scale: motion.scale.liftCover }],
    shadowOffset: { width: 0, height: space[24] },
    shadowRadius: space[64],
    shadowOpacity: 1,
  },
  anchored: {
    position: 'absolute',
  },
});
