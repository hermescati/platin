import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/library/GameCover';
import { statuses, statusLabels, tierLabels, tiers } from '@/components/library/labels';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { removeGame, setPlatformOwned, setStatus, setTier, useGame } from '@/db/library';
import { useGamePlatforms } from '@/db/platforms';
import { usePlaytime } from '@/db/sessions';
import { formatMinutes } from '@/lib/duration';
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
  const platforms = useGamePlatforms(id) ?? [];
  const playtime = usePlaytime(id);

  if (!game) {
    return <View style={[styles.fill, { backgroundColor: color.bg.screen }]} />;
  }

  const tierChoices = tiers.filter((tier) => tier !== 'platinum' || game.canEarnPlatinum || game.tier === tier);
  const subtitle = [game.developer, game.releaseYear].filter(Boolean).join(' · ');

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
        {subtitle !== '' && (
          <Text variant="subhead" tone="secondary">{subtitle}</Text>
        )}
      </View>

      {playtime && playtime.totalMinutes > 0 && (
        <Section title="Playtime">
          <View style={styles.playtime}>
            <Text variant="title2">{formatMinutes(playtime.totalMinutes)}</Text>
            <Text variant="subhead" tone="secondary">
              {playtime.platforms.map((platform) => `${platform.shortName} ${formatMinutes(platform.minutes)}`).join(' · ')}
            </Text>
          </View>
        </Section>
      )}

      <Section title="Status">
        {statuses.map((status) => (
          <Chip
            key={status}
            label={statusLabels[status]}
            selected={game.status === status}
            onPress={() => setStatus(db, game.id, status)}
          />
        ))}
      </Section>

      <Section title="Completion">
        {tierChoices.map((tier) => (
          <Chip
            key={tier}
            label={tierLabels[tier]}
            selected={game.tier === tier}
            onPress={() => setTier(db, game.id, game.tier === tier ? null : tier)}
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
  playtime: {
    gap: space[4],
  },
  remove: {
    alignItems: 'center',
    paddingVertical: space[16],
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
});
