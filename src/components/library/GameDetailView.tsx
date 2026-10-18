import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/library/GameCover';
import {
  activityStatuses,
  activityStatusLabels,
  completionTierLabels,
  completionTiers,
} from '@/components/library/labels';
import { Chip } from '@/components/ui/Chip';
import { removeGame, setActivityStatus, setCompletionTier, setPlatformOwned, useGame } from '@/db/library';
import { usePlatforms } from '@/db/platforms';
import { fontSize, layout, opacity, radius, spacing } from '@/theme/tokens';
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
      <Text style={[styles.sectionTitle, { color: color.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: color.surface }]}>{children}</View>
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
    return <View style={[styles.fill, { backgroundColor: color.background }]} />;
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
      style={{ backgroundColor: color.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.hero}>
        <View style={styles.cover}>
          <GameCover title={game.title} coverImageId={game.coverImageId} />
        </View>
        <Text style={[styles.title, { color: color.textPrimary }]}>{game.title}</Text>
        {game.releaseYear !== null && (
          <Text style={[styles.subtitle, { color: color.textSecondary }]}>{game.releaseYear}</Text>
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
          { backgroundColor: color.surface, opacity: pressed ? opacity.pressed : 1 },
        ]}>
        <Text style={[styles.removeLabel, { color: color.danger }]}>Remove from library</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  cover: {
    width: layout.detailCoverWidth,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
  },
  remove: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
  },
  removeLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
