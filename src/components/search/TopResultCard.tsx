import { Image } from 'expo-image';
import type { ComponentRef, Ref } from 'react';
import { useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { GlassButton } from '@/components/ui/GlassButton';
import { Text } from '@/components/ui/Text';
import { usePressScale } from '@/hooks/usePressScale';
import { igdbCoverUrl } from '@/lib/igdb';
import { blur, layout, opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type TopResultAccessory = 'chevron' | 'plus' | 'check';

interface Props {
  title: string;
  coverImageId: string | null;
  status: string;
  meta: string;
  accessory: TopResultAccessory;
  accessoryPressed?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onAccessoryPress?: () => void;
  accessoryRef?: Ref<ComponentRef<typeof View>>;
}

const accessoryIcons = { chevron: 'chevronRight', plus: 'plus', check: 'check' } as const;

export const TopResultCard = ({
  title,
  coverImageId,
  status,
  meta,
  accessory,
  accessoryPressed,
  onPress,
  onLongPress,
  onAccessoryPress,
  accessoryRef,
}: Props) => {
  const { color } = useTheme();
  const press = usePressScale();
  const glowId = `top-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const source = coverImageId ? igdbCoverUrl(coverImageId) : null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}>
      <Animated.View style={[styles.card, { backgroundColor: color.bg.surface }, press.style]}>
        {source && (
          <Image
            source={source}
            blurRadius={blur.coverGlow}
            style={[styles.glow, { opacity: opacity.coverGlow }]}
            contentFit="cover"
          />
        )}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id={glowId} cx="0%" cy="0%" r="130%">
              <Stop offset="0" stopColor={color.bg.surface} stopOpacity={0} />
              <Stop offset="0.6" stopColor={color.bg.surface} stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${glowId})`} />
        </Svg>
        <View style={styles.content}>
          <View style={styles.coverWrap}>
            {source && (
              <Image
                source={source}
                blurRadius={blur.coverShadow}
                style={[styles.coverShadow, { opacity: opacity.coverShadow }]}
                contentFit="cover"
              />
            )}
            <View style={[styles.cover, { backgroundColor: color.bg.raised }]}>
              {source && <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />}
            </View>
          </View>
          <View style={styles.text}>
            <Text variant="subheadEmphasized" tone="secondary" numberOfLines={1}>{status}</Text>
            <Text variant="gameTitle" numberOfLines={2}>{title}</Text>
            {meta ? <Text variant="subhead" tone="secondary" numberOfLines={1}>{meta}</Text> : null}
          </View>
          <GlassButton
            ref={accessoryRef}
            label={accessory === 'plus' ? `Add ${title}` : accessory === 'check' ? `${title} added` : `Open ${title}`}
            icon={accessoryIcons[accessory]}
            iconOnly
            pressed={accessoryPressed}
            onPress={onAccessoryPress ?? onPress}
          />
        </View>
        <View pointerEvents="none" style={[styles.rim, { borderColor: color.line.hairline }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -space[40],
    left: -space[40],
    right: -space[40],
    bottom: -space[40],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    padding: space[16],
  },
  coverWrap: {
    width: layout.topResultCover.width,
    height: layout.topResultCover.height,
  },
  coverShadow: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    top: space[8],
    height: layout.topResultCover.height - space[8],
    borderRadius: radius.md,
  },
  cover: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    gap: space[6],
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.lg,
    borderWidth: layout.hairline,
  },
});
