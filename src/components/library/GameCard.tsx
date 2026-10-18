import { StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { activityStatusLabels, completionTierLabels } from '@/components/library/labels';
import type { LibraryGame } from '@/db/types';
import { fontSize, spacing } from '@/theme/tokens';
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
    <View style={[styles.card, { width }]} accessible accessibilityLabel={`${game.title}, ${meta}`}>
      <GameCover title={game.title} coverImageId={game.coverImageId} badge={badge} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: color.textPrimary }]} numberOfLines={2}>
          {game.title}
        </Text>
        <Text style={[styles.meta, { color: color.textSecondary }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </View>
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
