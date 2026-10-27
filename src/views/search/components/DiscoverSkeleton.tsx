import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Pulse } from '@/ui/Pulse';

const { peek, slots } = layout.carousel;
const shelfTiles = [0, 1, 2];

export const DiscoverSkeleton = () => {
  const { color } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = width - space.gutter * 2 - peek * (slots - 1);

  return (
    <View style={styles.sections} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Pulse style={[styles.card, { width: cardWidth, backgroundColor: color.bg.surface }]} />
      <View style={styles.section}>
        <Pulse style={[styles.title, { backgroundColor: color.line.track }]} />
        <View style={styles.row}>
          {shelfTiles.map((tile) => (
            <Pulse key={tile} style={[styles.tile, { backgroundColor: color.bg.surface }]} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sections: {
    gap: space[32],
  },
  card: {
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  section: {
    gap: space[16],
  },
  title: {
    width: '60%',
    height: layout.skeletonLine.large,
    borderRadius: radius.xs,
  },
  row: {
    flexDirection: 'row',
    gap: space[16],
  },
  tile: {
    width: layout.shelfTile,
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
});
