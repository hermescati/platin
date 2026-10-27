import { Pressable, StyleSheet, View } from 'react-native';

import { GameCover } from '@/shared/game/components/GameCover';
import { statusLabels, tierLabels } from '@/shared/game/labels';
import { openGame } from '@/shared/game/routes';
import { Text } from '@/ui/Text';
import type { LibraryGame } from '@/db/types';
import { opacity, space } from '@/theme/tokens';

interface Props {
  game: LibraryGame;
  width: number;
}

export const GameCard = ({ game, width }: Props) => {
  const meta = [game.platforms, statusLabels[game.status]].filter(Boolean).join(' · ');
  const badge = game.tier ? tierLabels[game.tier] : undefined;

  return (
    <Pressable
      onPress={() => openGame(game.id)}
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
