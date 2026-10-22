import { Pressable, StyleSheet, View } from 'react-native';

import { GameCover } from '@/components/library/GameCover';
import { Text } from '@/components/ui/Text';
import { layout, opacity, space } from '@/theme/tokens';

interface Props {
  title: string;
  coverImageId: string | null;
  detail: string;
  onPress?: () => void;
}

export const SearchResultRow = ({ title, coverImageId, detail, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, { opacity: pressed ? opacity.pressed : 1 }]}>
      <View style={styles.cover}>
        <GameCover title={title} coverImageId={coverImageId} compact />
      </View>
      <View style={styles.text}>
        <Text variant="subheadEmphasized" numberOfLines={2}>
          {title}
        </Text>
        {detail.length > 0 && (
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
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
    gap: space[16],
    paddingVertical: space[8],
  },
  cover: {
    width: layout.searchCoverWidth,
  },
  text: {
    flex: 1,
    gap: space[2],
  },
});
