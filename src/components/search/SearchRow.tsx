import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon/Icon';
import { Text } from '@/components/ui/Text';
import { igdbCoverUrl } from '@/lib/igdb';
import { layout, opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  highlight?: string;
  subtitle?: string;
  icon?: IconName;
  coverImageId?: string | null;
  accessory: 'remove' | 'fill';
  onPress: () => void;
  onAccessoryPress: () => void;
}

const splitMatch = (title: string, highlight?: string) => {
  const at = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (!highlight || at < 0) {
    return null;
  }
  return [title.slice(0, at), title.slice(at, at + highlight.length), title.slice(at + highlight.length)];
};

export const SearchRow = ({
  title,
  highlight,
  subtitle,
  icon,
  coverImageId,
  accessory,
  onPress,
  onAccessoryPress,
}: Props) => {
  const { color } = useTheme();
  const parts = splitMatch(title, highlight);
  const hasThumb = coverImageId !== undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, hasThumb ? styles.thumbRow : styles.iconRow, pressed && { opacity: opacity.pressed }]}>
      {icon && <Icon name={icon} size={20} tone="secondary" />}
      {hasThumb && (
        <View style={[styles.thumb, { backgroundColor: color.bg.surface }]}>
          {coverImageId && <Image source={igdbCoverUrl(coverImageId)} style={StyleSheet.absoluteFill} contentFit="cover" />}
        </View>
      )}
      <View style={styles.text}>
        {parts ? (
          <Text variant="body" tone="secondary" numberOfLines={1}>
            {parts[0]}
            <Text variant="headline" style={styles.match}>{parts[1]}</Text>
            {parts[2]}
          </Text>
        ) : (
          <Text variant="body" numberOfLines={1}>{title}</Text>
        )}
        {subtitle && <Text variant="listSubtitle" tone="secondary" numberOfLines={1}>{subtitle}</Text>}
      </View>
      <Pressable
        onPress={onAccessoryPress}
        hitSlop={space[16]}
        accessibilityRole="button"
        accessibilityLabel={accessory === 'remove' ? `Remove ${title}` : `Fill in ${title}`}>
        <Icon
          name={accessory === 'remove' ? 'close' : 'arrowUpLeft'}
          size={accessory === 'remove' ? 14 : 18}
          weight="bold"
          tone="secondary"
        />
      </Pressable>
      {accessory === 'remove' && <View style={[styles.divider, { backgroundColor: color.line.hairline }]} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
  },
  iconRow: {
    paddingVertical: space[16],
  },
  thumbRow: {
    paddingVertical: space[8],
  },
  thumb: {
    width: layout.suggestionThumb.width,
    height: layout.suggestionThumb.height,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    gap: space[2],
  },
  match: {
    fontWeight: '700',
  },
  divider: {
    position: 'absolute',
    left: space[32] + space[4],
    right: 0,
    bottom: 0,
    height: layout.hairline,
  },
});
