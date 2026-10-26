import { TabScrollView } from 'expo-lucent';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { GameCard } from '@/components/library/GameCard';
import type { LibraryGame } from '@/db/types';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  games: LibraryGame[];
}

const gap = space[16];
const columns = layout.libraryColumns;

export const LibraryGrid = ({ games }: Props) => {
  const { color } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - gap * 2 - gap * (columns - 1)) / columns);

  return (
    <TabScrollView style={{ backgroundColor: color.bg.screen }} contentContainerStyle={styles.content}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} width={cardWidth} />
      ))}
    </TabScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: gap,
    rowGap: space[24],
    paddingHorizontal: gap,
    paddingTop: gap,
    paddingBottom: gap,
  },
});
