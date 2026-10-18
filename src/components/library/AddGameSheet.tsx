import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/library/GameCover';
import { activityStatusLabels } from '@/components/library/labels';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { addCatalogGame } from '@/db/library';
import { platformIdsFromIgdb, usePlatforms } from '@/db/platforms';
import type { ActivityStatus } from '@/db/types';
import type { CatalogGame } from '@/lib/catalog';
import { fontSize, layout, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  game: CatalogGame;
}

const statuses: ActivityStatus[] = ['playing', 'backlog', 'wishlist', 'dropped'];

export const AddGameSheet = ({ game }: Props) => {
  const { color } = useTheme();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const platforms = usePlatforms() ?? [];
  const gamePlatformIds = platformIdsFromIgdb(game.platforms);
  const choices = gamePlatformIds.length > 0 ? platforms.filter((p) => gamePlatformIds.includes(p.id)) : platforms;
  const [status, setStatus] = useState<ActivityStatus>('backlog');
  const [selected, setSelected] = useState<string[]>(gamePlatformIds.length === 1 ? gamePlatformIds : []);
  const [saving, setSaving] = useState(false);

  const togglePlatform = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const add = async () => {
    setSaving(true);
    await addCatalogGame(db, game, status, selected);
    router.back();
  };

  return (
    <View style={[styles.sheet, { backgroundColor: color.surface, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.header}>
        <View style={styles.cover}>
          <GameCover title={game.name} coverImageId={game.coverId} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: color.textPrimary }]} numberOfLines={3}>
            {game.name}
          </Text>
          {game.releaseYear !== null && (
            <Text style={[styles.subtitle, { color: color.textSecondary }]}>{game.releaseYear}</Text>
          )}
        </View>
      </View>

      <Text style={[styles.section, { color: color.textSecondary }]}>Status</Text>
      <View style={styles.chips}>
        {statuses.map((value) => (
          <Chip
            key={value}
            label={activityStatusLabels[value]}
            selected={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>

      {choices.length > 0 && (
        <>
          <Text style={[styles.section, { color: color.textSecondary }]}>Platforms</Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cover: {
    width: layout.sheetCoverWidth,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  section: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    marginTop: spacing.xl,
  },
});
