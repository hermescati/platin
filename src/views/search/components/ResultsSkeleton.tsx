import { StyleSheet, View } from 'react-native';

import { Pulse } from '@/ui/Pulse';
import { SectionHeader } from '@/ui/SectionHeader';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  tileWidth: number;
}

export const ResultsSkeleton = ({ tileWidth }: Props) => {
  const { color } = useTheme();
  const line = (width: `${number}%`, height: number) => (
    <View style={[styles.line, { width, height, backgroundColor: color.line.track }]} />
  );

  return (
    <View style={styles.sections} accessibilityLabel="Searching" accessibilityRole="progressbar">
      <View style={styles.section}>
        <SectionHeader title="Top result" />
        <Pulse style={[styles.card, { backgroundColor: color.bg.surface }]}>
          <View style={[styles.cover, { backgroundColor: color.line.track }]} />
          <View style={styles.lines}>
            {line('40%', layout.skeletonLine.medium)}
            {line('85%', layout.skeletonLine.large)}
            {line('55%', layout.skeletonLine.medium)}
          </View>
        </Pulse>
      </View>
      <View style={styles.section}>
        <SectionHeader title="More results" />
        <View style={styles.grid}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={[styles.tile, { width: tileWidth }]}>
              <Pulse style={[styles.tileCover, { backgroundColor: color.bg.surface }]} />
              <Pulse style={styles.tileLines}>
                {line('80%', layout.skeletonLine.medium)}
                {line('50%', layout.skeletonLine.small)}
              </Pulse>
            </View>
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
  section: {
    gap: space[16],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    padding: space[16],
    borderRadius: radius.lg,
  },
  cover: {
    width: layout.topResultCover.width,
    height: layout.topResultCover.height,
    borderRadius: radius.md,
  },
  lines: {
    flex: 1,
    gap: space[8],
  },
  line: {
    borderRadius: radius.full,
  },
  grid: {
    flexDirection: 'row',
    gap: space[16],
  },
  tile: {
    gap: space[8],
  },
  tileCover: {
    width: '100%',
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
  },
  tileLines: {
    gap: space[6],
  },
});
