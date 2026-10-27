import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/icons/Icon';
import { Text } from '@/ui/Text';
import { igdbCoverUrl } from '@/lib/igdb';
import { cover, layout, motion, radius, space } from '@/theme/tokens';

interface Props {
  title: string;
  coverImageId: string | null;
  badge?: string;
  compact?: boolean;
}

const placeholderColor = (title: string): string => {
  let hash = 0;
  for (const char of title) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return cover.placeholders[Math.abs(hash) % cover.placeholders.length];
};

export const GameCover = ({ title, coverImageId, badge, compact = false }: Props) => (
  <View style={[styles.cover, { backgroundColor: placeholderColor(title), borderRadius: compact ? radius.sm : radius.md }]}>
    {coverImageId ? (
      <Image source={igdbCoverUrl(coverImageId)} style={StyleSheet.absoluteFill} contentFit="cover" transition={motion.fade} />
    ) : (
      <View style={styles.placeholder}>
        <Icon name="gamepad" variant="fill" size={layout.coverIconSize} color={cover.icon} />
      </View>
    )}
    {badge && (
      <View style={styles.badge}>
        <Text variant="captionEmphasized" style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    aspectRatio: layout.coverAspectRatio,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: space[4],
    left: space[4],
    paddingHorizontal: space[6],
    paddingVertical: space[2],
    borderRadius: radius.full,
    backgroundColor: cover.badge,
  },
  badgeText: {
    color: cover.text,
  },
});
