import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { activityStatusLabels, completionTierLabels } from '@/components/library/labels';
import { Text } from '@/components/ui/Text';
import type { LibraryGame } from '@/db/types';
import { opacity, space } from '@/theme/tokens';

interface Props {
  game: LibraryGame;
  width: number;
}

export const GameCard = ({ game, width }: Props) => {
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
        <Text variant="footnoteEmphasized" numberOfLines={2}>
          {game.title}
        </Text>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: space[8],
  },
  text: {
    gap: space[2],
  },
});
