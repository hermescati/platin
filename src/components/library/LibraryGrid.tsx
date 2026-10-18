import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';

import { GameCard } from '@/components/library/GameCard';
import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import type { LibraryGame } from '@/db/types';
import { layout, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  games: LibraryGame[];
}

const gap = spacing.md;
const columns = layout.libraryColumns;

export const LibraryGrid = ({ games }: Props) => {
  const { color } = useTheme();
  const { width } = useWindowDimensions();
  const tabBarInset = useTabBarInset();
  const cardWidth = (width - gap * 2 - gap * (columns - 1)) / columns;

  return (
    <FlatList
      data={games}
      keyExtractor={(game) => game.id}
      numColumns={columns}
      renderItem={({ item }) => <GameCard game={item} width={cardWidth} />}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: color.background }}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset + gap }]}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: gap,
    paddingTop: gap,
    gap: spacing.lg,
  },
  row: {
    gap,
  },
});
