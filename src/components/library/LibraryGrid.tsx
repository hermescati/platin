import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

import { GameCard } from '@/components/library/GameCard';
import { TabScrollMarker } from '@/components/tab-bar/TabScrollMarker';
import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import { useTabBarScroll } from '@/components/tab-bar/useTabBarScroll';
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
  const onScroll = useTabBarScroll();
  const cardWidth = Math.floor((width - gap * 2 - gap * (columns - 1)) / columns);

  return (
    <TabScrollMarker>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ backgroundColor: color.background }}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset + gap }]}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} width={cardWidth} />
        ))}
      </Animated.ScrollView>
    </TabScrollMarker>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: gap,
    rowGap: spacing.lg,
    paddingHorizontal: gap,
    paddingTop: gap,
  },
});
