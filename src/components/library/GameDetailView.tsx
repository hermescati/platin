import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/library/GameCover';
import {
  activityStatuses,
  activityStatusLabels,
  completionTierLabels,
  completionTiers,
} from '@/components/library/labels';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { removeGame, setActivityStatus, setCompletionTier, setPlatformOwned, useGame } from '@/db/library';
import { usePlatforms } from '@/db/platforms';
import { layout, opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  id: string;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => {
  const { color } = useTheme();

  return (
    <View style={styles.section}>
      <Text variant="eyebrow" tone="secondary" style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.card, { backgroundColor: color.bg.surface }]}>{children}</View>
    </View>
  );
};

export const GameDetailView = ({ id }: Props) => {
  const { color } = useTheme();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const game = useGame(id);
  const platforms = usePlatforms() ?? [];

  if (!game) {
    return <View style={[styles.fill, { backgroundColor: color.bg.screen }]} />;
  }

  const tiers = completionTiers.filter((tier) => tier !== 'mastered' || game.canMaster || game.completionTier === tier);

  const confirmRemove = () => {
    Alert.alert(`Remove ${game.title}?`, 'It will be removed from your library.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeGame(db, game.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: color.bg.screen }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[32] }]}>
      <View style={styles.hero}>
        <View style={styles.cover}>
          <GameCover title={game.title} coverImageId={game.coverImageId} />
        </View>
        <Text variant="gameTitle" style={styles.title}>{game.title}</Text>
        {game.releaseYear !== null && (
          <Text variant="subhead" tone="secondary">{game.releaseYear}</Text>
        )}
      </View>

      <Section title="Status">
        {activityStatuses.map((status) => (
          <Chip
            key={status}
            label={activityStatusLabels[status]}
            selected={game.activityStatus === status}
            onPress={() => setActivityStatus(db, game.id, status)}
          />
        ))}
      </Section>

      <Section title="Completion">
        {tiers.map((tier) => (
          <Chip
            key={tier}
            label={completionTierLabels[tier]}
            selected={game.completionTier === tier}
            onPress={() => setCompletionTier(db, game.id, game.completionTier === tier ? null : tier)}
          />
        ))}
      </Section>

      <Section title="Platforms">
        {platforms.map((platform) => {
          const owned = game.platformIds.includes(platform.id);
          return (
            <Chip
              key={platform.id}
              label={platform.shortName}
              selected={owned}
              onPress={() => setPlatformOwned(db, game.id, platform.id, !owned)}
            />
          );
        })}
      </Section>

      <Pressable
        onPress={confirmRemove}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.remove,
          { backgroundColor: color.bg.surface, opacity: pressed ? opacity.pressed : 1 },
        ]}>
        <Text variant="headline" tone="danger">Remove from library</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space[16],
    gap: space[24],
  },
  hero: {
    alignItems: 'center',
    gap: space[4],
    paddingTop: space[16],
  },
  cover: {
    width: layout.detailCoverWidth,
    marginBottom: space[8],
  },
  title: {
    textAlign: 'center',
  },
  section: {
    gap: space[8],
  },
  sectionTitle: {
    paddingHorizontal: space[4],
  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[8],
    padding: space[16],
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  remove: {
    alignItems: 'center',
    paddingVertical: space[16],
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
});
