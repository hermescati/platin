import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { fontSize, layout, opacity, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  coverImageId: string | null;
  detail: string;
  onPress?: () => void;
}

export const SearchResultRow = ({ title, coverImageId, detail, onPress }: Props) => {
  const { color } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, { opacity: pressed ? opacity.pressed : 1 }]}>
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
    </Pressable>
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
