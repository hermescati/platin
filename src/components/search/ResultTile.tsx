import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon/Icon';
import { FadeText } from '@/components/ui/FadeText';
import { Text } from '@/components/ui/Text';
import { usePressScale } from '@/hooks/usePressScale';
import { igdbCoverUrl } from '@/lib/igdb';
import { cover, layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  subtitle: string;
  coverImageId: string | null;
  width: number;
  badge?: string | null;
  statusIcon?: IconName;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const ResultTile = ({ title, subtitle, coverImageId, width, badge, statusIcon, onPress, onLongPress }: Props) => {
  const { color } = useTheme();
  const press = usePressScale();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      style={{ width }}>
      <Animated.View style={[styles.tile, press.style]}>
        <View style={[styles.cover, { backgroundColor: color.bg.surface, borderColor: color.cover.edge }]}>
          {coverImageId && (
            <Image source={igdbCoverUrl(coverImageId)} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
          {badge && (
            <View style={[styles.pill, { backgroundColor: cover.badge }]}>
              <Text variant="captionEmphasized" style={{ color: cover.text }}>{badge}</Text>
            </View>
          )}
          {statusIcon && (
            <View style={[styles.status, { backgroundColor: cover.badge }]}>
              <Icon name={statusIcon} size={14} color={cover.text} />
            </View>
          )}
        </View>
        <View style={styles.caption}>
          <FadeText variant="subheadEmphasized">{title}</FadeText>
          {subtitle ? <FadeText variant="caption" tone="secondary">{subtitle}</FadeText> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    gap: space[8],
  },
  cover: {
    width: '100%',
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: layout.hairline / 2,
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    left: space[6],
    top: space[6],
    height: layout.coverPillHeight,
    paddingHorizontal: space[8],
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  status: {
    position: 'absolute',
    left: space[6],
    bottom: space[6],
    width: layout.coverStatusSize,
    height: layout.coverStatusSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    gap: space[2],
  },
});
