import { StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { fontSize, layout, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  coverImageId: string | null;
  detail: string;
}

export const SearchResultRow = ({ title, coverImageId, detail }: Props) => {
  const { color } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.cover}>
        <GameCover title={title} coverImageId={coverImageId} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: color.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        {detail.length > 0 && (
          <Text style={[styles.detail, { color: color.textSecondary }]} numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  cover: {
    width: layout.searchCoverWidth,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  detail: {
    fontSize: fontSize.sm,
  },
});
