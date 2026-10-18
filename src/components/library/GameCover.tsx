import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { igdbCoverUrl } from '@/lib/igdb';
import { cover, fontSize, layout, radius, spacing } from '@/theme/tokens';

interface Props {
  title: string;
  coverImageId: string | null;
  badge?: string;
}

const placeholderColor = (title: string): string => {
  let hash = 0;
  for (const char of title) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return cover.placeholders[Math.abs(hash) % cover.placeholders.length];
};

export const GameCover = ({ title, coverImageId, badge }: Props) => (
  <View style={[styles.cover, { backgroundColor: placeholderColor(title) }]}>
    {coverImageId ? (
      <Image source={igdbCoverUrl(coverImageId)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
    ) : (
      <View style={styles.placeholder}>
        <SymbolView
          name={{ ios: 'gamecontroller.fill', android: 'sports_esports' }}
          size={layout.coverIconSize}
          tintColor={cover.icon}
        />
      </View>
    )}
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
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
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs + spacing.xxs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: cover.badge,
  },
  badgeText: {
    color: cover.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
