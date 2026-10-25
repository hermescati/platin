import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { TabScrollMarker, useTabBarInset, useTabBarScroll } from 'expo-lucent';

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
  const tabBarInset = useTabBarInset();
  const onScroll = useTabBarScroll();
  const cardWidth = Math.floor((width - gap * 2 - gap * (columns - 1)) / columns);

  return (
    <TabScrollMarker>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ backgroundColor: color.bg.screen }}
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
    rowGap: space[24],
    paddingHorizontal: gap,
    paddingTop: gap,
  },
});
