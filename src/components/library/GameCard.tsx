import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { activityStatusLabels, completionTierLabels } from '@/components/library/labels';
import type { LibraryGame } from '@/db/types';
import { fontSize, opacity, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  game: LibraryGame;
  width: number;
}

export const GameCard = ({ game, width }: Props) => {
  const { color } = useTheme();
  const meta = [game.platforms, activityStatusLabels[game.activityStatus]].filter(Boolean).join(' · ');
  const badge = game.completionTier ? completionTierLabels[game.completionTier] : undefined;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${game.title}, ${meta}`}
      style={({ pressed }) => [styles.card, { width, opacity: pressed ? opacity.pressed : 1 }]}>
      <GameCover title={game.title} coverImageId={game.coverImageId} badge={badge} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: color.textPrimary }]} numberOfLines={2}>
          {game.title}
        </Text>
        <Text style={[styles.meta, { color: color.textSecondary }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  text: {
    gap: spacing.xxs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  meta: {
    fontSize: fontSize.xs,
  },
});
