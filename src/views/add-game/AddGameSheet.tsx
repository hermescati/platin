import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/shared/game/components/GameCover';
import { statuses, statusLabels, tierLabels } from '@/shared/game/labels';
import { Chip } from '@/ui/Chip';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Text } from '@/ui/Text';
import { addCatalogGame, findRemovedGame, restoreGame } from '@/db/library';
import { usePlatformsByIds, useUserPlatformIds } from '@/db/platforms';
import type { GameStatus } from '@/db/types';
import type { CatalogGame } from '@/lib/catalog';
import { formatMinutes } from '@/lib/duration';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  game: CatalogGame;
}

export const AddGameSheet = ({ game }: Props) => {
  const { color } = useTheme();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const choices = usePlatformsByIds(game.platformIds) ?? [];
  const userPlatformIds = useUserPlatformIds() ?? [];
  const yours = choices.filter((platform) => userPlatformIds.includes(platform.id));
  const suggested = yours.length === 1 ? [yours[0].id] : choices.length === 1 ? [choices[0].id] : [];
  const [status, setStatus] = useState<GameStatus>('backlog');
  const [picked, setPicked] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const selected = picked ?? suggested;

  const togglePlatform = (id: number) => {
    setPicked(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  };

  const addFresh = async () => {
    await addCatalogGame(db, game, status, status === 'wishlist' ? [] : selected);
    router.back();
  };

  const add = async () => {
    setSaving(true);
    const removed = await findRemovedGame(db, game.id);
    if (!removed) {
      await addFresh();
      return;
    }
    const summary = [
      removed.totalMinutes > 0 ? formatMinutes(removed.totalMinutes) : null,
      removed.tier ? tierLabels[removed.tier] : null,
      removed.platforms,
      removed.addons > 0 ? `${removed.addons} add-on${removed.addons === 1 ? '' : 's'}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    Alert.alert(`You played ${game.name} before`, summary || 'Your old status and dates are still here.', [
      { text: 'Start fresh', style: 'destructive', onPress: addFresh },
      {
        text: 'Restore',
        style: 'default',
        isPreferred: true,
        onPress: async () => {
          await restoreGame(db, removed.id);
          router.back();
        },
      },
    ]);
    setSaving(false);
  };

  return (
    <View style={[styles.sheet, { backgroundColor: color.bg.sheet, paddingBottom: insets.bottom + space[16] }]}>
      <View style={styles.header}>
        <View style={styles.cover}>
          <GameCover title={game.name} coverImageId={game.coverId} />
        </View>
        <View style={styles.titleBlock}>
          <Text variant="title2" numberOfLines={3}>
            {game.name}
          </Text>
          {game.releaseYear !== null && (
            <Text variant="subhead" tone="secondary">{game.releaseYear}</Text>
          )}
        </View>
      </View>

      <Text variant="eyebrow" tone="secondary" style={styles.section}>Status</Text>
      <View style={styles.chips}>
        {statuses.map((value) => (
          <Chip
            key={value}
            label={statusLabels[value]}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>

      {status !== 'wishlist' && choices.length > 0 && (
        <>
          <Text variant="eyebrow" tone="secondary" style={styles.section}>Platforms</Text>
          <View style={styles.chips}>
            {choices.map((platform) => (
              <Chip
                key={platform.id}
                label={platform.shortName}
                selected={selected.includes(platform.id)}
                onPress={() => togglePlatform(platform.id)}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.action}>
        <PrimaryButton label="Add to library" disabled={saving} onPress={add} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space[24],
    paddingTop: space[24],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
  },
  cover: {
    width: layout.sheetCoverWidth,
  },
  titleBlock: {
    flex: 1,
    gap: space[4],
  },
  section: {
    marginTop: space[24],
    marginBottom: space[8],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[8],
  },
  action: {
    marginTop: space[32],
  },
});
